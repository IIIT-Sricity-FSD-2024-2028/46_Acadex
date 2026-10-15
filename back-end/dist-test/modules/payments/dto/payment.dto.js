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
exports.TransactionQueryDto = exports.CreateTransactionDto = exports.TransactionStatus = exports.TransactionType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
var TransactionType;
(function (TransactionType) {
    TransactionType["PAYMENT"] = "Payment";
    TransactionType["PAYOUT"] = "Payout";
    TransactionType["REFUND"] = "Refund";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["COMPLETED"] = "Completed";
    TransactionStatus["PENDING"] = "Pending";
    TransactionStatus["FAILED"] = "Failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
class CreateTransactionDto {
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TransactionType, example: TransactionType.PAYMENT }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(TransactionType),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Alex Chen' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "payer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Advanced Enterprise Architecture & Payment Systems' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "course", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 89.99 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Visa •••• 4242' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TransactionStatus, example: TransactionStatus.COMPLETED }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TransactionStatus),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "status", void 0);
class TransactionQueryDto extends pagination_dto_1.PaginationQueryDto {
}
exports.TransactionQueryDto = TransactionQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TransactionType, description: 'Filter by transaction type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TransactionType),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TransactionStatus, description: 'Filter by status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TransactionStatus),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "status", void 0);
//# sourceMappingURL=payment.dto.js.map