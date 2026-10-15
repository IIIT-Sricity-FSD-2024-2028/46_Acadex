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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let AssignmentsService = class AssignmentsService {
    constructor(assignmentsRepo, submissionsRepo) {
        this.assignmentsRepo = assignmentsRepo;
        this.submissionsRepo = submissionsRepo;
    }
    async findAll() {
        return this.assignmentsRepo.find();
    }
    async findOne(id) {
        const asg = await this.assignmentsRepo.findById(id);
        if (!asg) {
            throw new common_1.NotFoundException(`Assignment '${id}' not found`);
        }
        asg.submissions = await this.submissionsRepo.find({ where: { assignmentId: id } });
        return asg;
    }
    async findByCourse(courseId) {
        return this.assignmentsRepo.find({ where: { courseId } });
    }
    async create(data) {
        return this.assignmentsRepo.create({
            id: `asg-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...data,
        });
    }
    async submit(assignmentId, data) {
        const asg = await this.assignmentsRepo.findById(assignmentId);
        if (!asg) {
            throw new common_1.NotFoundException(`Assignment '${assignmentId}' not found`);
        }
        return this.submissionsRepo.create({
            id: `sub-${Date.now()}`,
            assignmentId,
            submittedAt: new Date().toISOString(),
            status: 'Submitted',
            ...data,
        });
    }
    async gradeSubmission(submissionId, score, feedback) {
        const updated = await this.submissionsRepo.update(submissionId, {
            score,
            feedback,
            status: 'Graded',
        });
        if (!updated) {
            throw new common_1.NotFoundException(`Submission '${submissionId}' not found`);
        }
        return updated;
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ASSIGNMENTS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.SUBMISSIONS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map