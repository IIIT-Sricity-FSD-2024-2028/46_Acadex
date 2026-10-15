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
exports.DecideJoinRequestDto = exports.CreateJoinRequestDto = exports.InstructorRequestQueryDto = exports.WithdrawTeachingRequestDto = exports.RespondTeachingRequestDto = exports.CreateTeachingRequestDto = exports.TeachingRequestDecision = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
var TeachingRequestDecision;
(function (TeachingRequestDecision) {
    TeachingRequestDecision["ACCEPTED"] = "Accepted";
    TeachingRequestDecision["DECLINED"] = "Declined";
})(TeachingRequestDecision || (exports.TeachingRequestDecision = TeachingRequestDecision = {}));
class CreateTeachingRequestDto {
}
exports.CreateTeachingRequestDto = CreateTeachingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'inst-1' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'crs-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AWS Solutions Architect Masterclass' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "courseTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Fall 2026' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "semester", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '4 Academic Credits' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "creditHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '70/30 faculty course royalty + $10,000 research grant' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "proposedTerms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Organization formal invitation for faculty teaching appointment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'org-101' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Meridian Tech Institute' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeachingRequestDto.prototype, "organizationName", void 0);
class RespondTeachingRequestDto {
}
exports.RespondTeachingRequestDto = RespondTeachingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TeachingRequestDecision, example: TeachingRequestDecision.ACCEPTED }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(TeachingRequestDecision),
    __metadata("design:type", String)
], RespondTeachingRequestDto.prototype, "decision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Professor accepted the assignment terms for Fall 2026.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RespondTeachingRequestDto.prototype, "notes", void 0);
class WithdrawTeachingRequestDto {
}
exports.WithdrawTeachingRequestDto = WithdrawTeachingRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Position fulfilled internally or canceled.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawTeachingRequestDto.prototype, "reason", void 0);
class InstructorRequestQueryDto extends pagination_dto_1.PaginationQueryDto {
}
exports.InstructorRequestQueryDto = InstructorRequestQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by request status (e.g. Pending, Accepted, Declined)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstructorRequestQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by instructor ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstructorRequestQueryDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by instructor email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstructorRequestQueryDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by organization ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstructorRequestQueryDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['invitation', 'join'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['invitation', 'join']),
    __metadata("design:type", String)
], InstructorRequestQueryDto.prototype, "type", void 0);
class CreateJoinRequestDto {
}
exports.CreateJoinRequestDto = CreateJoinRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'org-1' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJoinRequestDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'I teach backend engineering and would like to join your faculty.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateJoinRequestDto.prototype, "message", void 0);
class DecideJoinRequestDto {
}
exports.DecideJoinRequestDto = DecideJoinRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['approve', 'reject'] }),
    (0, class_validator_1.IsIn)(['approve', 'reject']),
    __metadata("design:type", String)
], DecideJoinRequestDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], DecideJoinRequestDto.prototype, "notes", void 0);
//# sourceMappingURL=instructor-request.dto.js.map