import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/roles.guard';

import { UsersModule } from './users/users.module';
import { InstructorsModule } from './instructors/instructors.module';
import { CoursesModule } from './courses/courses.module';
import { LearnersModule } from './learners/learners.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CertificatesModule } from './certificates/certificates.module';
import { DisputesModule } from './disputes/disputes.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RefundsModule } from './refunds/refunds.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [
    UsersModule,
    InstructorsModule,
    CoursesModule,
    LearnersModule,
    OrganizationsModule,
    CertificatesModule,
    DisputesModule,
    EnrollmentsModule,
    NotificationsModule,
    TransactionsModule,
    AnalyticsModule,
    RefundsModule,
    ReviewsModule,
    ReportsModule,
    QuizzesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
