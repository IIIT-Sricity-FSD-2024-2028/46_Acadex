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
exports.InstructorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const instructors_service_1 = require("./instructors.service");
const instructor_dto_1 = require("./dto/instructor.dto");
let InstructorsController = class InstructorsController {
    constructor(instructorsService) {
        this.instructorsService = instructorsService;
    }
    async findAll(query) {
        return this.instructorsService.findAll(query);
    }
    async findOne(id) {
        return this.instructorsService.findOne(id);
    }
    async create(dto) {
        return this.instructorsService.create(dto);
    }
    async update(id, dto) {
        return this.instructorsService.update(id, dto);
    }
    async delete(id) {
        return this.instructorsService.delete(id);
    }
    async getCourses(id) {
        return this.instructorsService.getInstructorCourses(id);
    }
    async leaveOrganization(id, userId) {
        return this.instructorsService.leaveOrganization(id, userId);
    }
};
exports.InstructorsController = InstructorsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all instructors with filtering, search, and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated instructors list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instructor_dto_1.InstructorQueryDto]),
    __metadata("design:returntype", Promise)
], InstructorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get instructor details and associated authored courses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns instructor profile and courses' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register/Add a new instructor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Instructor created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instructor_dto_1.CreateInstructorDto]),
    __metadata("design:returntype", Promise)
], InstructorsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update instructor details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Instructor updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, instructor_dto_1.UpdateInstructorDto]),
    __metadata("design:returntype", Promise)
], InstructorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an instructor record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Instructor deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get courses authored or co-instructed by this instructor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns courses list' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorsController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Post)(':id/leave-organization'),
    (0, swagger_1.ApiOperation)({ summary: 'Instructor leaves their organization' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InstructorsController.prototype, "leaveOrganization", null);
exports.InstructorsController = InstructorsController = __decorate([
    (0, swagger_1.ApiTags)('Instructors'),
    (0, common_1.Controller)('instructors'),
    __metadata("design:paramtypes", [instructors_service_1.InstructorsService])
], InstructorsController);
//# sourceMappingURL=instructors.controller.js.map