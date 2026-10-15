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
exports.LearnersService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let LearnersService = class LearnersService {
    constructor(learnersRepo, enrollmentsRepo) {
        this.learnersRepo = learnersRepo;
        this.enrollmentsRepo = enrollmentsRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, learnerType, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (learnerType && learnerType !== 'All') {
            where.learnerType = learnerType;
        }
        if (status && status !== 'All') {
            where.status = status;
        }
        if (search) {
            where.$or = [
                { name: { $contains: search } },
                { email: { $contains: search } },
                { university: { $contains: search } },
            ];
        }
        return this.learnersRepo.findAndCount({
            where,
            skip,
            limit,
            sort: { [sortBy]: sortOrder },
        });
    }
    async findOne(id) {
        const learner = await this.learnersRepo.findById(id);
        if (!learner) {
            throw new common_1.NotFoundException(`Learner with ID '${id}' not found`);
        }
        const enrollments = await this.enrollmentsRepo.find({
            where: { learnerId: id },
        });
        return {
            ...learner,
            enrollments,
        };
    }
    async create(dto) {
        const newLearner = await this.learnersRepo.create({
            ...dto,
            enrolledCourses: 0,
            completedCourses: 0,
            overallProgress: 0,
            avgScore: '0%',
            certificatesCount: 0,
            status: dto.status || 'Active',
            totalSpent: 0,
            avatar: dto.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            joinedDate: dto.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
        return newLearner;
    }
    async update(id, dto) {
        const existing = await this.learnersRepo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Learner with ID '${id}' not found`);
        }
        return this.learnersRepo.update(id, dto);
    }
    async delete(id) {
        const existing = await this.learnersRepo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Learner with ID '${id}' not found`);
        }
        return this.learnersRepo.delete(id);
    }
    async getLearnerEnrollments(id) {
        await this.findOne(id);
        return this.enrollmentsRepo.find({
            where: { learnerId: id },
        });
    }
};
exports.LearnersService = LearnersService;
exports.LearnersService = LearnersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], LearnersService);
//# sourceMappingURL=learners.service.js.map