import {CourseMediaGuard} from './course-media.guard';
import {diskStorage} from 'multer';
import {randomUUID} from 'crypto';
import {extname,resolve} from 'path';
import {mkdirSync} from 'fs';
import {
  Body, Controller, Delete, Get, Req,
  Param, Patch, Post, Put, Query,
  UseInterceptors, UploadedFile,UseGuards,BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForbiddenException } from '@nestjs/common';
import { WorkspaceService } from '../platform/workspace.service';
import { CourseWorkflowService } from './course-workflow.service';
import { CoursesService } from './courses.service';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService, private readonly workflow:CourseWorkflowService, private readonly workspace:WorkspaceService) {}

  @Get('organization/list') async organizationCourses(@Req() req:any,@Query() query:any){return this.workflow.organizationCourses(await this.workspace.identity(req.headers),query);}
  @Post(':id/archive') async archive(@Param('id') id:string,@Req() req:any){return this.workflow.archive(id,await this.workspace.identity(req.headers));}
  @Post(':id/restore') async restore(@Param('id') id:string,@Req() req:any){return this.workflow.restore(id,await this.workspace.identity(req.headers));}
  @Get('assignment-options') async assignmentOptions(@Req() req:any){return this.workflow.assignmentOptions(await this.workspace.identity(req.headers));}
  @Post('assignments') async assign(@Body() body:any,@Req() req:any){return this.workflow.assign(body,await this.workspace.identity(req.headers));}
  @Get(':id/organization') async organizationCourse(@Param('id') id:string,@Req() req:any){return this.workflow.organizationCourse(id,await this.workspace.identity(req.headers));}
  @Get(':id/editor') async editor(@Param('id') id:string,@Req() req:any){return this.workflow.editor(id,await this.workspace.identity(req.headers));}
  @Put(':id/curriculum-draft') async draft(@Param('id') id:string,@Body() body:any,@Req() req:any){return this.workflow.saveDraft(id,body,await this.workspace.identity(req.headers));}
  @Post(':id/submit') async submit(@Param('id') id:string,@Req() req:any){return this.workflow.submit(id,await this.workspace.identity(req.headers));}
  @Post(':id/module-requests') async requestModules(@Param('id') id:string,@Body() body:any,@Req() req:any){return this.workflow.request(id,body,await this.workspace.identity(req.headers));}
  @Get('module-requests/mine') async moduleRequests(@Req() req:any,@Query('courseId') courseId:string){return this.workflow.list(await this.workspace.identity(req.headers),courseId);}
  @Post('module-requests/:requestId/decision') async decideModules(@Param('requestId') id:string,@Body() body:any,@Req() req:any){return this.workflow.decide(id,body,await this.workspace.identity(req.headers));}

  @Get()
  @ApiOperation({ summary: 'List all courses with category, level, status filters and search' })
  @ApiResponse({ status: 200, description: 'Returns paginated courses list' })
  async findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed course information with modules and instructors' })
  @ApiResponse({ status: 200, description: 'Returns course details' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course with multi-instructor team and curriculum modules' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async create(@Body() dto: CreateCourseDto,@Req() req:any) {
    const actor=await this.workspace.identity(req.headers);
    if(actor.canonicalRole!=='organization'||!actor.profileId)throw new ForbiddenException('Only organizations can create courses.');
    const requested=dto.status;dto.status='Draft';
    const course=await this.coursesService.create(dto,actor.profileId);
    this.workflow.assertOrganization(actor,course);
    await this.workflow.notifyAssignments(course,null,actor);
    return ['Published','Pending Approval'].includes(requested)?this.workflow.submit(course.id,actor):course;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update/Replace course details' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async updateFull(@Param('id') id: string, @Body() dto: UpdateCourseDto,@Req() req:any) {
    return this.updatePartial(id,dto,req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update course details' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async updatePartial(@Param('id') id: string, @Body() dto: UpdateCourseDto,@Req() req:any) {
    const actor=await this.workspace.identity(req.headers);const course=await this.workflow.course(id);
    if(actor.canonicalRole==='instructor'){
      if(Object.keys(dto).some(k=>k!=='modules'))throw new ForbiddenException('Instructors submit curriculum changes for organization approval.');
      return this.workflow.saveDraft(id,dto,actor);
    }
    this.workflow.assertOrganization(actor,course);
    const update=async()=>{const updated=await this.coursesService.update(id,dto);await this.workflow.notifyAssignments(updated,course,actor);return updated;};
    if(dto.status==='Published'||dto.status==='Pending Approval'){
      if(course.status==='Published'&&dto.status==='Published'){delete dto.status;return update();}
      delete dto.status;if(Object.keys(dto).length)await update();return this.workflow.submit(id,actor);
    }
    return update();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a course while preserving its history' })
  @ApiResponse({ status: 200, description: 'Course archived successfully' })
  async delete(@Param('id') id: string,@Req() req:any) {
    this.workflow.assertOrganization(await this.workspace.identity(req.headers),await this.workflow.course(id));
    return this.workflow.archive(id,await this.workspace.identity(req.headers));
  }

  // ──────────────────────────────────────────────────────────────
  // FILE UPLOAD – POST /api/courses/:id/upload
  // Course-scoped media uploads are authorized before writing to disk.
  // ──────────────────────────────────────────────────────────────
  @Post(':id/upload')
  @UseGuards(CourseMediaGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage:diskStorage({destination:(_req,_file,cb)=>{const dir=resolve(process.env.COURSE_UPLOAD_DIR||'uploads');mkdirSync(dir,{recursive:true});cb(null,dir);},filename:(_req,file,cb)=>cb(null,randomUUID()+extname(file.originalname).toLowerCase())}),
      limits:{fileSize:100*1024*1024},
      fileFilter:(_req,file,cb)=>{const extension=extname(file.originalname).toLowerCase();if(!['.mp4','.webm','.mov','.m4v','.pdf','.png','.jpg','.jpeg','.gif','.webp'].includes(extension))return cb(new BadRequestException('Upload a video, PDF or image.'),false);cb(null,true);}
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a course thumbnail or material (video, PDF or image, max 100 MB)',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a course thumbnail or material file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Choose a file to upload.');
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        courseId:  id,
        filename:  file.filename,
        original:  file.originalname,
        size:      file.size,
        path:      `/uploads/${file.filename}`,
      },
    };
  }
}
