import {WorkspaceService} from '../platform/workspace.service';
import { Module } from '@nestjs/common';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';

@Module({
  controllers: [InstructorsController],
  providers: [InstructorsService,WorkspaceService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
