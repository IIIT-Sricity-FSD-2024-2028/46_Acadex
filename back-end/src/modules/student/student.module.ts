import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  controllers: [StudentController],
  imports: [OrganizationModule],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
