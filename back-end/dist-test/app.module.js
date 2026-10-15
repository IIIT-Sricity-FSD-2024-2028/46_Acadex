"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const error_handler_middleware_1 = require("./common/middleware/error-handler.middleware");
const security_middleware_1 = require("./common/middleware/security.middleware");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const student_module_1 = require("./modules/student/student.module");
const organization_module_1 = require("./modules/organization/organization.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const instructors_module_1 = require("./modules/instructors/instructors.module");
const instructor_requests_module_1 = require("./modules/instructor-requests/instructor-requests.module");
const learners_module_1 = require("./modules/learners/learners.module");
const courses_module_1 = require("./modules/courses/courses.module");
const enrollments_module_1 = require("./modules/enrollments/enrollments.module");
const assignments_module_1 = require("./modules/assignments/assignments.module");
const quizzes_module_1 = require("./modules/quizzes/quizzes.module");
const certificates_module_1 = require("./modules/certificates/certificates.module");
const payments_module_1 = require("./modules/payments/payments.module");
const refunds_module_1 = require("./modules/refunds/refunds.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const disputes_module_1 = require("./modules/disputes/disputes.module");
const reports_module_1 = require("./modules/reports/reports.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const settings_module_1 = require("./modules/settings/settings.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(security_middleware_1.SecurityMiddleware, logger_middleware_1.LoggerMiddleware, error_handler_middleware_1.ErrorHandlerMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            student_module_1.StudentModule,
            organization_module_1.OrganizationModule,
            dashboard_module_1.DashboardModule,
            instructors_module_1.InstructorsModule,
            instructor_requests_module_1.InstructorRequestsModule,
            learners_module_1.LearnersModule,
            courses_module_1.CoursesModule,
            enrollments_module_1.EnrollmentsModule,
            assignments_module_1.AssignmentsModule,
            quizzes_module_1.QuizzesModule,
            certificates_module_1.CertificatesModule,
            payments_module_1.PaymentsModule,
            refunds_module_1.RefundsModule,
            reviews_module_1.ReviewsModule,
            disputes_module_1.DisputesModule,
            reports_module_1.ReportsModule,
            analytics_module_1.AnalyticsModule,
            notifications_module_1.NotificationsModule,
            settings_module_1.SettingsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map