"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.REPOSITORY_TOKENS = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("./json-db.service");
const json_repository_1 = require("./json-repository");
exports.REPOSITORY_TOKENS = {
    USERS: 'USERS_REPOSITORY',
    ORGANIZATION: 'ORGANIZATION_REPOSITORY',
    ORGANIZATIONS: 'ORGANIZATION_REPOSITORY',
    UNIVERSITIES: 'UNIVERSITIES_REPOSITORY',
    INSTRUCTORS: 'INSTRUCTORS_REPOSITORY',
    INSTRUCTOR_REQUESTS: 'INSTRUCTOR_REQUESTS_REPOSITORY',
    LEARNERS: 'LEARNERS_REPOSITORY',
    STUDENTS: 'STUDENTS_REPOSITORY',
    ADMINS: 'ADMINS_REPOSITORY',
    COURSES: 'COURSES_REPOSITORY',
    MODULES: 'MODULES_REPOSITORY',
    LESSONS: 'LESSONS_REPOSITORY',
    ENROLLMENTS: 'ENROLLMENTS_REPOSITORY',
    ASSIGNMENTS: 'ASSIGNMENTS_REPOSITORY',
    SUBMISSIONS: 'SUBMISSIONS_REPOSITORY',
    QUIZZES: 'QUIZZES_REPOSITORY',
    QUIZ_QUESTIONS: 'QUIZ_QUESTIONS_REPOSITORY',
    CERTIFICATES: 'CERTIFICATES_REPOSITORY',
    TRANSACTIONS: 'TRANSACTIONS_REPOSITORY',
    PAYMENTS: 'TRANSACTIONS_REPOSITORY',
    REFUNDS: 'REFUNDS_REPOSITORY',
    REVIEWS: 'REVIEWS_REPOSITORY',
    DISPUTES: 'DISPUTES_REPOSITORY',
    REPORTS: 'REPORTS_REPOSITORY',
    NOTIFICATIONS: 'NOTIFICATIONS_REPOSITORY',
    SETTINGS: 'SETTINGS_REPOSITORY',
};
const repositoryProviders = [
    {
        provide: exports.REPOSITORY_TOKENS.USERS,
        useFactory: (db) => new json_repository_1.JsonRepository('users', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.ORGANIZATION,
        useFactory: (db) => new json_repository_1.JsonRepository('organizations', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.UNIVERSITIES,
        useFactory: (db) => new json_repository_1.JsonRepository('universities', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.INSTRUCTORS,
        useFactory: (db) => new json_repository_1.JsonRepository('instructors', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS,
        useFactory: (db) => new json_repository_1.JsonRepository('instructor_requests', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.LEARNERS,
        useFactory: (db) => new json_repository_1.JsonRepository('learners', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.STUDENTS,
        useFactory: (db) => new json_repository_1.JsonRepository('students', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.ADMINS,
        useFactory: (db) => new json_repository_1.JsonRepository('admins', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.COURSES,
        useFactory: (db) => new json_repository_1.JsonRepository('courses', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.MODULES,
        useFactory: (db) => new json_repository_1.JsonRepository('modules', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.LESSONS,
        useFactory: (db) => new json_repository_1.JsonRepository('lessons', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.ENROLLMENTS,
        useFactory: (db) => new json_repository_1.JsonRepository('enrollments', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.ASSIGNMENTS,
        useFactory: (db) => new json_repository_1.JsonRepository('assignments', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.SUBMISSIONS,
        useFactory: (db) => new json_repository_1.JsonRepository('submissions', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.QUIZZES,
        useFactory: (db) => new json_repository_1.JsonRepository('quizzes', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.QUIZ_QUESTIONS,
        useFactory: (db) => new json_repository_1.JsonRepository('quiz_questions', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.CERTIFICATES,
        useFactory: (db) => new json_repository_1.JsonRepository('certificates', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.TRANSACTIONS,
        useFactory: (db) => new json_repository_1.JsonRepository('transactions', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.REFUNDS,
        useFactory: (db) => new json_repository_1.JsonRepository('refunds', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.REVIEWS,
        useFactory: (db) => new json_repository_1.JsonRepository('reviews', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.DISPUTES,
        useFactory: (db) => new json_repository_1.JsonRepository('disputes', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.REPORTS,
        useFactory: (db) => new json_repository_1.JsonRepository('reports', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.NOTIFICATIONS,
        useFactory: (db) => new json_repository_1.JsonRepository('notifications', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
    {
        provide: exports.REPOSITORY_TOKENS.SETTINGS,
        useFactory: (db) => new json_repository_1.JsonRepository('settings', db),
        inject: [json_db_service_1.JsonDatabaseService],
    },
];
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [json_db_service_1.JsonDatabaseService, ...repositoryProviders],
        exports: [json_db_service_1.JsonDatabaseService, ...repositoryProviders],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map