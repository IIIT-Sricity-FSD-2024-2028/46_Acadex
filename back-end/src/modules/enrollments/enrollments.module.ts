import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  controllers: [EnrollmentsController],
  imports: [OrganizationModule],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
