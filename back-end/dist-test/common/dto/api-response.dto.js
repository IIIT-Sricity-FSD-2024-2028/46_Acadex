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
exports.PaginatedResponseEnvelope = exports.ApiResponseEnvelope = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApiResponseEnvelope {
}
exports.ApiResponseEnvelope = ApiResponseEnvelope;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ApiResponseEnvelope.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ApiResponseEnvelope.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-30T10:00:00.000Z' }),
    __metadata("design:type", String)
], ApiResponseEnvelope.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Operation completed successfully', required: false }),
    __metadata("design:type", String)
], ApiResponseEnvelope.prototype, "message", void 0);
class PaginatedResponseEnvelope {
}
exports.PaginatedResponseEnvelope = PaginatedResponseEnvelope;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PaginatedResponseEnvelope.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], PaginatedResponseEnvelope.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-30T10:00:00.000Z' }),
    __metadata("design:type", String)
], PaginatedResponseEnvelope.prototype, "timestamp", void 0);
//# sourceMappingURL=api-response.dto.js.map