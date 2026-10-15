"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const instructor_requests_controller_1 = require("./instructor-requests.controller");
const instructor_requests_service_1 = require("./instructor-requests.service");
let InstructorRequestsModule = class InstructorRequestsModule {
};
exports.InstructorRequestsModule = InstructorRequestsModule;
exports.InstructorRequestsModule = InstructorRequestsModule = __decorate([
    (0, common_1.Module)({
        controllers: [instructor_requests_controller_1.InstructorRequestsController],
        providers: [instructor_requests_service_1.InstructorRequestsService],
        exports: [instructor_requests_service_1.InstructorRequestsService],
    })
], InstructorRequestsModule);
//# sourceMappingURL=instructor-requests.module.js.map