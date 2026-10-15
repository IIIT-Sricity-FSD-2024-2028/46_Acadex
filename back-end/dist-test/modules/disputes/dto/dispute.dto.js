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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeQueryDto = exports.ResolveDisputeDto = exports.UpdateDisputeStatusDto = exports.CreateDisputeDto = exports.DisputeRole = exports.DisputeStatus = exports.DisputePriority = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
var DisputePriority;
(function (DisputePriority) {
    DisputePriority["LOW"] = "Low";
    DisputePriority["MEDIUM"] = "Medium";
    DisputePriority["HIGH"] = "High";
    DisputePriority["URGENT"] = "Urgent";
})(DisputePriority || (exports.DisputePriority = DisputePriority = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["OPEN"] = "Open";
    DisputeStatus["UNDER_REVIEW"] = "Under Review";
    DisputeStatus["ESCALATED"] = "Escalated";
    DisputeStatus["RESOLVED"] = "Resolved";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var DisputeRole;
(function (DisputeRole) {
    DisputeRole["ORGANIZATION"] = "Organization";
    DisputeRole["EDUCATOR"] = "Educator";
    DisputeRole["LEARNER"] = "Learner";
})(DisputeRole || (exports.DisputeRole = DisputeRole = {}));
class CreateDisputeDto {
}
exports.CreateDisputeDto = CreateDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Prof. James Wilson' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "raisedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'inst-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "raisedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: DisputeRole, example: DisputeRole.EDUCATOR }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DisputeRole),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "raisedByRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Royalty Payout Discrepancy' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "disputeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Q3 Co-instructor Royalty Split Discrepancy for AWS Module' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Discrepancy in revenue royalty calculation for Advanced Enterprise Architecture course.' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Advanced Enterprise Architecture & Payment Systems' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "courseTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'crs-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: DisputePriority, example: DisputePriority.HIGH }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DisputePriority),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Recalculate Q3 corporate cohort revenue and issue adjustment credit.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "desiredResolution", void 0);
class UpdateDisputeStatusDto {
}
exports.UpdateDisputeStatusDto = UpdateDisputeStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DisputeStatus, example: DisputeStatus.UNDER_REVIEW }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(DisputeStatus),
    __metadata("design:type", String)
], UpdateDisputeStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dispute assigned to Senior Governance Council.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDisputeStatusDto.prototype, "adminNote", void 0);
class ResolveDisputeDto {
}
exports.ResolveDisputeDto = ResolveDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Credit adjustment approved and processed via finance settlement ledger.' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveDisputeDto.prototype, "resolutionNote", void 0);
class DisputeQueryDto extends pagination_dto_1.PaginationQueryDto {
}
exports.DisputeQueryDto = DisputeQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: DisputeStatus, description: 'Filter by dispute status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DisputeStatus),
    __metadata("design:type", String)
], DisputeQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: DisputePriority, description: 'Filter by priority level' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DisputePriority),
    __metadata("design:type", String)
], DisputeQueryDto.prototype, "priority", void 0);
//# sourceMappingURL=dispute.dto.js.map