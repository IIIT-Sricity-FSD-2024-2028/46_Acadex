import {CourseMediaGuard} from './course-media.guard';
import { WorkspaceService } from '../platform/workspace.service';
import { CourseWorkflowService } from './course-workflow.service';
import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  controllers: [CoursesController],
  providers: [CourseMediaGuard,CoursesService, CourseWorkflowService, WorkspaceService],
  exports: [CoursesService],
})
export class CoursesModule {}
