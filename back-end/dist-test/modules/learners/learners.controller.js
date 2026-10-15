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
exports.LearnersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const learners_service_1 = require("./learners.service");
const learner_dto_1 = require("./dto/learner.dto");
let LearnersController = class LearnersController {
    constructor(learnersService) {
        this.learnersService = learnersService;
    }
    async findAll(query) {
        return this.learnersService.findAll(query);
    }
    async findOne(id) {
        return this.learnersService.findOne(id);
    }
    async create(dto) {
        return this.learnersService.create(dto);
    }
    async update(id, dto) {
        return this.learnersService.update(id, dto);
    }
    async delete(id) {
        return this.learnersService.delete(id);
    }
    async getEnrollments(id) {
        return this.learnersService.getLearnerEnrollments(id);
    }
};
exports.LearnersController = LearnersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all enrolled learners (students & professionals)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated learners list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learner_dto_1.LearnerQueryDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get learner profile and their enrolled courses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns learner profile and enrollments' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register/Add a new learner' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Learner registered successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learner_dto_1.CreateLearnerDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update learner details or academic metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Learner updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, learner_dto_1.UpdateLearnerDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a learner record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Learner deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/enrollments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course enrollments for this learner' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns enrollments list' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "getEnrollments", null);
exports.LearnersController = LearnersController = __decorate([
    (0, swagger_1.ApiTags)('Learners'),
    (0, common_1.Controller)('learners'),
    __metadata("design:paramtypes", [learners_service_1.LearnersService])
], LearnersController);
//# sourceMappingURL=learners.controller.js.map