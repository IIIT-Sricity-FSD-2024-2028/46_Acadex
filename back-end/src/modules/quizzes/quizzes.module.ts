import {WorkspaceService} from '../platform/workspace.service';
import {CourseWorkflowService} from '../courses/course-workflow.service';
import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService,WorkspaceService,CourseWorkflowService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
