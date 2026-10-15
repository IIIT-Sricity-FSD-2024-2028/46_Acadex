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
exports.DisputesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const disputes_service_1 = require("./disputes.service");
const dispute_dto_1 = require("./dto/dispute.dto");
let DisputesController = class DisputesController {
    constructor(disputesService) {
        this.disputesService = disputesService;
    }
    async findAll(query) {
        return this.disputesService.findAll(query);
    }
    async findOne(id) {
        return this.disputesService.findOne(id);
    }
    async create(dto) {
        return this.disputesService.create(dto);
    }
    async updateStatus(id, dto) {
        return this.disputesService.updateStatus(id, dto);
    }
    async resolve(id, dto) {
        return this.disputesService.resolve(id, dto);
    }
    async delete(id) {
        return this.disputesService.delete(id);
    }
};
exports.DisputesController = DisputesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all organization disputes with status, priority filters and search' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated disputes list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispute_dto_1.DisputeQueryDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dispute ticket details and history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns dispute details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Raise a new dispute ticket (Royalty, Content Quality, Plagiarism, IP)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dispute ticket logged successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispute_dto_1.CreateDisputeDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update dispute workflow status (Open, Under Review, Escalated, Resolved)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute status updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dispute_dto_1.UpdateDisputeStatusDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve a dispute ticket with formal resolution rationale' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute resolved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dispute_dto_1.ResolveDisputeDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "resolve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a dispute ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "delete", null);
exports.DisputesController = DisputesController = __decorate([
    (0, swagger_1.ApiTags)('Disputes & Governance'),
    (0, common_1.Controller)('disputes'),
    __metadata("design:paramtypes", [disputes_service_1.DisputesService])
], DisputesController);
//# sourceMappingURL=disputes.controller.js.map