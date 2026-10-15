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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organization_service_1 = require("./organization.service");
const update_organization_dto_1 = require("./dto/update-organization.dto");
let OrganizationController = class OrganizationController {
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    async getProfile(userId, userEmail) {
        return this.organizationService.getProfile(userId, userEmail);
    }
    async updateProfile(dto, userId, userEmail) {
        return this.organizationService.updateProfile(dto, userId, userEmail);
    }
    async getStats(userId, userEmail) {
        return this.organizationService.getStats(userId, userEmail);
    }
    async getStudentJoinRequests(userId, userEmail) {
        return this.organizationService.getStudentJoinRequests(userId, userEmail);
    }
    async respondStudentJoinRequest(learnerId, body, userId, userEmail) {
        return this.organizationService.respondStudentJoinRequest(learnerId, body.action, userId, userEmail);
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization profile details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns organization details' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Headers)('x-user-email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update organization profile details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Organization profile updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-user-email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_organization_dto_1.UpdateOrganizationDto, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dynamic organization telemetry & statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns aggregated institutional stats' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Headers)('x-user-email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('student-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending student membership join requests' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Headers)('x-user-email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getStudentJoinRequests", null);
__decorate([
    (0, common_1.Post)('student-requests/:id/respond'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject a learner membership request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Headers)('x-user-email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "respondStudentJoinRequest", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, swagger_1.ApiTags)('Organization'),
    (0, common_1.Controller)('organization'),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map