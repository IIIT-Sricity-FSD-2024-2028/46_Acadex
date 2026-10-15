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
exports.EnrollmentQueryDto = exports.UpdateEnrollmentStatusDto = exports.UpdateEnrollmentProgressDto = exports.AssignCoursesToLearnersDto = exports.EnrollmentStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "Active";
    EnrollmentStatus["COMPLETED"] = "Completed";
    EnrollmentStatus["DROPPED"] = "Dropped";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
class AssignCoursesToLearnersDto {
}
exports.AssignCoursesToLearnersDto = AssignCoursesToLearnersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['crs-1', 'crs-2'], description: 'List of course IDs to assign' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AssignCoursesToLearnersDto.prototype, "courseIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['lrn-1', 'lrn-2'], description: 'List of learner IDs to enroll' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AssignCoursesToLearnersDto.prototype, "learnerIds", void 0);
class UpdateEnrollmentProgressDto {
}
exports.UpdateEnrollmentProgressDto = UpdateEnrollmentProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75, minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateEnrollmentProgressDto.prototype, "progress", void 0);
class UpdateEnrollmentStatusDto {
}
exports.UpdateEnrollmentStatusDto = UpdateEnrollmentStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EnrollmentStatus, example: EnrollmentStatus.COMPLETED }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(EnrollmentStatus),
    __metadata("design:type", String)
], UpdateEnrollmentStatusDto.prototype, "status", void 0);
class EnrollmentQueryDto extends pagination_dto_1.PaginationQueryDto {
}
exports.EnrollmentQueryDto = EnrollmentQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by learner ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrollmentQueryDto.prototype, "learnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by course ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrollmentQueryDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by enrollment status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrollmentQueryDto.prototype, "status", void 0);
//# sourceMappingURL=enrollment.dto.js.map