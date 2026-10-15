"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_response_interceptor_1 = require("./common/interceptors/transform-response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const roles_guard_1 = require("./common/guards/roles.guard");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix);
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_response_interceptor_1.TransformResponseInterceptor());
    const reflector = app.get(core_1.Reflector);
    app.useGlobalGuards(new roles_guard_1.RolesGuard(reflector));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const swaggerPath = process.env.SWAGGER_PATH || 'api/docs';
    const config = new swagger_1.DocumentBuilder()
        .setTitle('NexusPay Enterprise EdTech Platform API')
        .setDescription('Consolidated Unified Backend API supporting all 4 system actors: Students / Learners, Instructors / Educators, Organizations, and Platform Administrators with persistent JSON Database engine matching 19 relational entities from the ER Diagram.')
        .setVersion('2.0.0')
        .addTag('Authentication & Identity', 'Sign in, registration, session management, and credential updates')
        .addTag('Student & Learner LMS', 'Student academic profile, enrollments, study plans, and checkout')
        .addTag('Instructors', 'Faculty management, educator profiles, ratings, and teaching assignments')
        .addTag('Instructor Requests', 'Faculty outreach requests, invitation tracking, and approvals')
        .addTag('Organization', 'Organization profile, institutional metrics, and entity verification')
        .addTag('Organizations - Directory & Governance', 'Accredited universities and enterprise organizations directory')
        .addTag('Courses', 'Course catalog, modules, lessons, and multi-instructor curriculum authoring')
        .addTag('Enrollments', 'Course enrollments, batch assignments, and learner progression')
        .addTag('Quizzes & Academic Assessments', 'Assessment authoring, question pools, and student evaluations')
        .addTag('Assignments & Practical Submissions', 'Practical assignments, code submissions, and grading')
        .addTag('Certificates & Verified Credentials', 'Verifiable credential issuance, digital certificates, and verification')
        .addTag('Payments & Transactions', 'Financial revenue settlement, tuition checkouts, and royalty splits')
        .addTag('Platform Admin - User Management', 'Platform user directory and administrative lifecycle controls')
        .addTag('Platform Admin - Refunds & Chargebacks', 'Tuition refund processing and chargeback administration')
        .addTag('Disputes & Governance', 'Institutional dispute tickets, priority escalation, and resolutions')
        .addTag('Reviews & Course Ratings', 'Student course reviews, star ratings, and educator feedback')
        .addTag('Analytics & Telemetry', 'Comprehensive learning and financial telemetry')
        .addTag('Reports & Exports', 'Executive and academic report generation and CSV exports')
        .addTag('Notifications', 'Real-time multi-role alerts and event notifications')
        .addTag('Settings & Database Governance', 'Administrative configuration and database state management')
        .addApiKey({ type: 'apiKey', name: 'x-role', in: 'header' }, 'x-role')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
        customSiteTitle: 'NexusPay EdTech API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`===========================================================`);
    logger.log(`🚀 Unified NestJS Backend running at: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📚 Swagger API Documentation:         http://localhost:${port}/${swaggerPath}`);
    logger.log(`💾 JSON Database Directory:           ${process.env.DATA_DIR || './data'}`);
    logger.log(`===========================================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map