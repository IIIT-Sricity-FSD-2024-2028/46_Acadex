"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const student_service_1 = require("./student.service");
const student_dto_1 = require("./dto/student.dto");
let StudentController = class StudentController {
    constructor(studentService) {
        this.studentService = studentService;
    }
    getProfile(userId) {
        return this.studentService.getProfile(userId);
    }
    updateProfile(dto, userId) {
        return this.studentService.updateProfile(userId, dto);
    }
    getOrganizations() {
        return this.studentService.getOrganizationsList();
    }
    requestJoinOrganization(body, userId) {
        return this.studentService.requestJoinOrganization(userId, body.organizationId, body.organizationName);
    }
    getCatalog() {
        return this.studentService.getCatalog();
    }
    getCatalogCourse(courseId) {
        return this.studentService.getCatalogCourse(courseId);
    }
    getEnrollments(userId) {
        return this.studentService.getEnrollments(userId);
    }
    getEnrollmentForCourse(courseId, userId) {
        return this.studentService.getEnrollmentForCourse(userId, courseId);
    }
    enroll(dto, userId) {
        return this.studentService.enrollCourse(userId, dto.courseId);
    }
    updateProgress(enrollmentId, dto, userId) {
        return this.studentService.updateProgress(userId, enrollmentId, dto.lessonId, dto.completed);
    }
    getCertificates(userId) {
        return this.studentService.getCertificates(userId);
    }
    getPayments(userId) {
        return this.studentService.getPayments(userId);
    }
    checkout(dto, userId) {
        return this.studentService.checkout(userId, dto);
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get learner profile with stats computed from enrollments and certificates' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update learner profile details' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_dto_1.UpdateStudentProfileDto, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'List organizations learners can request to join' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getOrganizations", null);
__decorate([
    (0, common_1.Post)('join-organization'),
    (0, swagger_1.ApiOperation)({ summary: 'Request to join an organization' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "requestJoinOrganization", null);
__decorate([
    (0, common_1.Get)('catalog'),
    (0, swagger_1.ApiOperation)({ summary: 'Published courses that have an assigned instructor' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getCatalog", null);
__decorate([
    (0, common_1.Get)('catalog/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Single available catalog course' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getCatalogCourse", null);
__decorate([
    (0, common_1.Get)('enrollments'),
    (0, swagger_1.ApiOperation)({ summary: 'List enrolled courses with progress' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getEnrollments", null);
__decorate([
    (0, common_1.Get)('enrollments/course/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the learner enrollment for a course' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getEnrollmentForCourse", null);
__decorate([
    (0, common_1.Post)('enrollments'),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll in a free course' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_dto_1.StudentEnrollDto, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "enroll", null);
__decorate([
    (0, common_1.Patch)('enrollments/:id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a lesson complete/incomplete; issues a certificate at 100%' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, student_dto_1.UpdateProgressDto, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Get)('certificates'),
    (0, swagger_1.ApiOperation)({ summary: 'List learner certificates' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getCertificates", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Learner payment history' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('payments/checkout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Pay for a course (card or UPI) and enroll' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_dto_1.StudentCheckoutDto, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "checkout", null);
exports.StudentController = StudentController = __decorate([
    (0, swagger_1.ApiTags)('Student & Learner LMS'),
    (0, common_1.Controller)('student'),
    __metadata("design:paramtypes", [student_service_1.StudentService])
], StudentController);
//# sourceMappingURL=student.controller.js.map