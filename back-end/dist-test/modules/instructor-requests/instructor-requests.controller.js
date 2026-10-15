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
exports.InstructorRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const instructor_requests_service_1 = require("./instructor-requests.service");
const instructor_request_dto_1 = require("./dto/instructor-request.dto");
let InstructorRequestsController = class InstructorRequestsController {
    constructor(requestsService) {
        this.requestsService = requestsService;
    }
    findAll(query) {
        return this.requestsService.findAll(query);
    }
    myJoinRequests(userId) {
        return this.requestsService.myJoinRequests(userId);
    }
    createJoinRequest(userId, dto) {
        return this.requestsService.createJoinRequest(userId, dto);
    }
    orgJoinRequests(userEmail) {
        return this.requestsService.orgJoinRequests(userEmail);
    }
    cancelJoinRequest(userId, id) {
        return this.requestsService.cancelJoinRequest(userId, id);
    }
    decideJoinRequest(userEmail, id, dto) {
        return this.requestsService.decideJoinRequest(userEmail, id, dto);
    }
    findOne(id) {
        return this.requestsService.findOne(id);
    }
    create(dto) {
        return this.requestsService.create(dto);
    }
    respond(id, dto) {
        return this.requestsService.respond(id, dto);
    }
    withdraw(id, dto) {
        return this.requestsService.withdraw(id, dto);
    }
    resend(id) {
        return this.requestsService.resend(id);
    }
    delete(id) {
        return this.requestsService.delete(id);
    }
};
exports.InstructorRequestsController = InstructorRequestsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List requests (filter by organizationId, instructorId, type)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instructor_request_dto_1.InstructorRequestQueryDto]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('join/mine'),
    (0, swagger_1.ApiOperation)({ summary: 'Join requests sent by the current instructor' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "myJoinRequests", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, swagger_1.ApiOperation)({ summary: 'Instructor requests to join an organization (needs organization approval)' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, instructor_request_dto_1.CreateJoinRequestDto]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "createJoinRequest", null);
__decorate([
    (0, common_1.Get)('join/incoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Join requests sent to the current organization' }),
    __param(0, (0, common_1.Headers)('x-user-email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "orgJoinRequests", null);
__decorate([
    (0, common_1.Patch)('join/:id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Instructor cancels a pending join request' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "cancelJoinRequest", null);
__decorate([
    (0, common_1.Patch)('join/:id/decide'),
    (0, swagger_1.ApiOperation)({ summary: 'Organization approves or rejects a join request' }),
    __param(0, (0, common_1.Headers)('x-user-email')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, instructor_request_dto_1.DecideJoinRequestDto]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "decideJoinRequest", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single request' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Organization sends a teaching invitation to an instructor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instructor_request_dto_1.CreateTeachingRequestDto]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/respond'),
    (0, swagger_1.ApiOperation)({ summary: 'Instructor accepts or declines a teaching invitation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, instructor_request_dto_1.RespondTeachingRequestDto]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "respond", null);
__decorate([
    (0, common_1.Patch)(':id/withdraw'),
    (0, swagger_1.ApiOperation)({ summary: 'Organization withdraws a pending invitation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, instructor_request_dto_1.WithdrawTeachingRequestDto]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)(':id/resend'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a reminder for a pending invitation' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "resend", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a request record' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstructorRequestsController.prototype, "delete", null);
exports.InstructorRequestsController = InstructorRequestsController = __decorate([
    (0, swagger_1.ApiTags)('Instructor Requests'),
    (0, common_1.Controller)('instructor-requests'),
    __metadata("design:paramtypes", [instructor_requests_service_1.InstructorRequestsService])
], InstructorRequestsController);
//# sourceMappingURL=instructor-requests.controller.js.map