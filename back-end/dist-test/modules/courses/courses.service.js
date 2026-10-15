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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let CoursesService = class CoursesService {
    constructor(coursesRepo, instructorsRepo, enrollmentsRepo) {
        this.coursesRepo = coursesRepo;
        this.instructorsRepo = instructorsRepo;
        this.enrollmentsRepo = enrollmentsRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, category, level, status, instructorId, organizationId, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (category && category !== 'All') {
            where.category = category;
        }
        if (level && level !== 'All') {
            where.level = level;
        }
        if (status && status !== 'All') {
            where.status = status;
        }
        if (instructorId) {
            where.$or = [
                { instructorId: instructorId },
                { 'instructors.id': instructorId },
            ];
        }
        if (organizationId) {
            where.organizationId = organizationId;
        }
        if (search) {
            where.$or = [
                { title: { $contains: search } },
                { category: { $contains: search } },
                { instructorName: { $contains: search } },
                { description: { $contains: search } },
            ];
        }
        return this.coursesRepo.findAndCount({
            where,
            skip,
            limit,
            sort: { [sortBy]: sortOrder },
        });
    }
    async findOne(id) {
        const course = await this.coursesRepo.findById(id);
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID '${id}' not found`);
        }
        const enrollments = await this.enrollmentsRepo.find({
            where: { courseId: id },
            limit: 10,
        });
        return {
            ...course,
            recentEnrollments: enrollments,
        };
    }
    async create(dto) {
        const instructorsList = await this.resolveInstructors(dto);
        const leadInstructor = instructorsList[0] || {
            id: 'inst-1',
            name: 'Prof. James Wilson',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            specialization: 'Cloud Architecture & AWS',
        };
        const modules = dto.modules || [
            { id: 'mod-1', title: 'Module 1: Architecture Foundations', lessons: 4, duration: '3h 15m' },
            { id: 'mod-2', title: 'Module 2: High Throughput Replication', lessons: 5, duration: '4h 00m' },
        ];
        const lessonsCount = modules.reduce((sum, m) => sum + (m.lessons || 3), 0);
        const newCourse = await this.coursesRepo.create({
            title: dto.title,
            category: dto.category || 'Cloud Architecture',
            level: dto.level || 'Advanced',
            instructorId: leadInstructor.id,
            instructorName: instructorsList.map((i) => i.name).join(', '),
            leadInstructorName: leadInstructor.name,
            instructors: instructorsList,
            enrolledCount: 0,
            price: typeof dto.price === 'number' ? dto.price : 89.99,
            revenue: 0,
            rating: 5.0,
            completionRate: 75,
            totalHours: '18h 30m',
            lessonsCount,
            modulesCount: modules.length,
            status: dto.status || 'Published',
            thumbnail: dto.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
            description: dto.description || 'Newly authored masterclass curriculum.',
            modules,
        });
        return newCourse;
    }
    async update(id, dto) {
        const existing = await this.coursesRepo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Course with ID '${id}' not found`);
        }
        let updatedInstructors = dto.instructors || existing.instructors || [];
        if (dto.instructorId || dto.coInstructorIds) {
            updatedInstructors = await this.resolveInstructors(dto);
        }
        const leadInst = updatedInstructors[0] || { id: existing.instructorId, name: existing.leadInstructorName };
        const modules = dto.modules || existing.modules || [];
        const lessonsCount = modules.reduce((sum, m) => sum + (m.lessons || 3), 0);
        return this.coursesRepo.update(id, {
            ...dto,
            instructors: updatedInstructors,
            instructorId: leadInst.id,
            leadInstructorName: leadInst.name,
            instructorName: updatedInstructors.map((i) => i.name).join(', '),
            modules,
            modulesCount: modules.length,
            lessonsCount,
            price: typeof dto.price === 'number' ? dto.price : existing.price,
        });
    }
    async delete(id) {
        const existing = await this.coursesRepo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Course with ID '${id}' not found`);
        }
        return this.coursesRepo.delete(id);
    }
    async resolveInstructors(dto) {
        if (dto.instructors && Array.isArray(dto.instructors) && dto.instructors.length > 0) {
            return dto.instructors;
        }
        const allInstructors = await this.instructorsRepo.find();
        const lead = allInstructors.find((i) => i.id === dto.instructorId) || allInstructors[0];
        const result = [
            {
                id: lead.id,
                name: lead.name,
                role: 'Lead Instructor',
                avatar: lead.avatar,
                specialization: lead.specialization,
            },
        ];
        if (Array.isArray(dto.coInstructorIds)) {
            dto.coInstructorIds.forEach((coId) => {
                if (coId !== lead.id) {
                    const co = allInstructors.find((i) => i.id === coId);
                    if (co) {
                        result.push({
                            id: co.id,
                            name: co.name,
                            role: 'Co-Instructor',
                            avatar: co.avatar,
                            specialization: co.specialization,
                        });
                    }
                }
            });
        }
        return result;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], CoursesService);
//# sourceMappingURL=courses.service.js.map