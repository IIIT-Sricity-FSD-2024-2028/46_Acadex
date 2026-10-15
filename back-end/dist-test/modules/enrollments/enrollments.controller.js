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
exports.EnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enrollments_service_1 = require("./enrollments.service");
const enrollment_dto_1 = require("./dto/enrollment.dto");
let EnrollmentsController = class EnrollmentsController {
    constructor(enrollmentsService) {
        this.enrollmentsService = enrollmentsService;
    }
    async findAll(query) {
        return this.enrollmentsService.findAll(query);
    }
    async findOne(id) {
        return this.enrollmentsService.findOne(id);
    }
    async create(body) {
        return this.enrollmentsService.createSingle(body);
    }
    async assignCourses(dto) {
        return this.enrollmentsService.assignCoursesToLearners(dto);
    }
    async updateProgress(id, dto) {
        return this.enrollmentsService.updateProgress(id, dto);
    }
    async updateStatus(id, dto) {
        return this.enrollmentsService.updateStatus(id, dto);
    }
    async delete(id) {
        return this.enrollmentsService.delete(id);
    }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all course enrollments with learner, course, and status filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated enrollments' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrollment_dto_1.EnrollmentQueryDto]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single enrollment record details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns enrollment details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll a single learner in a course' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Enrollment created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch assign multiple courses to multiple learners atomically with billing transactions' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Enrollments and transactions created atomically' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrollment_dto_1.AssignCoursesToLearnersDto]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "assignCourses", null);
__decorate([
    (0, common_1.Patch)(':id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Update learner progress (0-100%) for an enrollment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Progress updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, enrollment_dto_1.UpdateEnrollmentProgressDto]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update enrollment status (Active, Completed, Dropped)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, enrollment_dto_1.UpdateEnrollmentStatusDto]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel/Delete an enrollment record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrollment deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "delete", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, swagger_1.ApiTags)('Enrollments'),
    (0, common_1.Controller)('enrollments'),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService])
], EnrollmentsController);
//# sourceMappingURL=enrollments.controller.js.map