import {ForbiddenException} from '@nestjs/common';
import {WorkspaceService} from '../platform/workspace.service';
import {CourseWorkflowService} from '../courses/course-workflow.service';
import { Controller, Get, Post, Patch, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizDto, CreateQuizQuestionDto } from './dto/quizzes.dto';

@ApiTags('Quizzes & Academic Assessments')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService,private readonly workspace:WorkspaceService,private readonly workflow:CourseWorkflowService) {}

  private async authorize(courseId:string,userId:string){const actor=await this.workspace.identity({'x-user-id':userId});const course=await this.workflow.course(courseId);if(actor.canonicalRole==='instructor')this.workflow.assertInstructor(actor,course);else this.workflow.assertOrganization(actor,course);return actor;}

  @Get()
  @ApiOperation({ summary: 'Get all quizzes' })
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID with questions' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get quiz associated with a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.findByCourse(courseId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course quiz' })
  async create(@Body() dto: CreateQuizDto,@Headers('x-user-id') userId:string) {
    const actor=await this.authorize(dto.courseId,userId);return this.quizzesService.create({...dto,...(actor.canonicalRole==='instructor'?{status:'Draft'}:{})});
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz and replace its question set' })
  async update(@Param('id') id: string, @Body() body: any,@Headers('x-user-id') userId:string) {
    const quiz=await this.quizzesService.findOne(id);const actor=await this.authorize(quiz.courseId,userId);
    if(actor.canonicalRole==='instructor'&&quiz.status==='Published'){
      const draft=await this.quizzesService.create({courseId:quiz.courseId,title:quiz.title,status:'Draft'} as any);
      return this.quizzesService.update(draft.id,{...quiz,...body,status:'Draft',questions:body.questions||quiz.questions});
    }
    return this.quizzesService.update(id,{...body,...(actor.canonicalRole==='instructor'?{status:'Draft'}:{})});
  }

  @Post('questions')
  @ApiOperation({ summary: 'Add a question to a quiz pool' })
  async addQuestion(@Body() dto: CreateQuizQuestionDto,@Headers('x-user-id') userId:string) {
    const quiz=await this.quizzesService.findOne(dto.quizId);const actor=await this.authorize(quiz.courseId,userId);if(actor.canonicalRole==='instructor'&&quiz.status==='Published')throw new ForbiddenException('Save a draft copy before changing a published assessment.');return this.quizzesService.addQuestion(dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quiz answers and get evaluation result' })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
    @Headers('x-user-id') userId: string = 'lrn-1'
  ) {
    return this.quizzesService.submitQuiz(id, dto, userId);
  }
}
