import {
  Body, Controller, Delete, Get, Req,
  Param, Patch, Post, Put, Query,
  UseInterceptors, UploadedFile,
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

  @Post(':id/submit') async submit(@Param('id') id:string,@Req() req:any){return this.workflow.submit(id,await this.workspace.identity(req.headers));}
  @Post(':id/module-requests') async requestModules(@Param('id') id:string,@Body() body:any,@Req() req:any){return this.workflow.request(id,body,await this.workspace.identity(req.headers));}
  @Get('module-requests/mine') async moduleRequests(@Req() req:any){return this.workflow.list(await this.workspace.identity(req.headers));}
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
      const request=await this.workflow.request(id,dto,actor);return {...course,pendingModuleRequest:request};
    }
    this.workflow.assertOrganization(actor,course);
    if(dto.status==='Published'||dto.status==='Pending Approval'){
      if(course.status==='Published'&&dto.status==='Published'){delete dto.status;return this.coursesService.update(id,dto);}
      delete dto.status;if(Object.keys(dto).length)await this.coursesService.update(id,dto);return this.workflow.submit(id,actor);
    }
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course record' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async delete(@Param('id') id: string,@Req() req:any) {
    this.workflow.assertOrganization(await this.workspace.identity(req.headers),await this.workflow.course(id));
    return this.coursesService.delete(id);
  }

  // ──────────────────────────────────────────────────────────────
  // FILE UPLOAD – POST /api/courses/:id/upload
  // Uses the multer middleware we created in upload.middleware.ts
  // ──────────────────────────────────────────────────────────────
  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',   // save files to /uploads folder
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a course thumbnail or material (image / PDF, max 5 MB)',
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
      return { success: false, message: 'No file received' };
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
