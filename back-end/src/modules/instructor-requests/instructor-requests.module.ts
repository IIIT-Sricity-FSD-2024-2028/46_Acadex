import {WorkspaceService} from '../platform/workspace.service';
import {CourseWorkflowService} from '../courses/course-workflow.service';
import { Module } from '@nestjs/common';
import { InstructorRequestsController } from './instructor-requests.controller';
import { InstructorRequestsService } from './instructor-requests.service';

@Module({
  controllers: [InstructorRequestsController],
  providers: [InstructorRequestsService,WorkspaceService,CourseWorkflowService],
  exports: [InstructorRequestsService],
})
export class InstructorRequestsModule {}
