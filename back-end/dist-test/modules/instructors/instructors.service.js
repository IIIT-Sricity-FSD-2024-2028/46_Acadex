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
exports.InstructorsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let InstructorsService = class InstructorsService {
    constructor(instructorsRepo, coursesRepo, orgsRepo, usersRepo) {
        this.instructorsRepo = instructorsRepo;
        this.coursesRepo = coursesRepo;
        this.orgsRepo = orgsRepo;
        this.usersRepo = usersRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, specialization, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (specialization) {
            where.specialization = { $contains: specialization };
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.$or = [
                { name: { $contains: search } },
                { email: { $contains: search } },
                { specialization: { $contains: search } },
            ];
        }
        return this.instructorsRepo.findAndCount({
            where,
            skip,
            limit,
            sort: { [sortBy]: sortOrder },
        });
    }
    async findOne(id) {
        const instructor = await this.instructorsRepo.findById(id);
        if (!instructor) {
            throw new common_1.NotFoundException(`Instructor with ID '${id}' not found`);
        }
        const courses = await this.coursesRepo.find({
            where: {
                $or: [
                    { instructorId: id },
                    { 'instructors.id': id },
                ],
            },
        });
        return {
            ...instructor,
            courses,
        };
    }
    async create(dto) {
        const newInstructor = await this.instructorsRepo.create({
            ...dto,
            coursesCount: 0,
            enrolledStudents: 0,
            avgRating: dto.avgRating || 5.0,
            revenueGenerated: 0,
            status: dto.status || 'Active',
            avatar: dto.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            joinedDate: dto.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
        return newInstructor;
    }
    async update(id, dto) {
        const existing = await this.instructorsRepo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Instructor with ID '${id}' not found`);
        }
        return this.instructorsRepo.update(id, dto);
    }
    async delete(id) {
        const existing = await this.instructorsRepo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Instructor with ID '${id}' not found`);
        }
        return this.instructorsRepo.delete(id);
    }
    async getInstructorCourses(id) {
        await this.findOne(id);
        return this.coursesRepo.find({
            where: {
                $or: [
                    { instructorId: id },
                    { 'instructors.id': id },
                ],
            },
        });
    }
    async leaveOrganization(id, userId) {
        const instructor = await this.instructorsRepo.findById(id);
        if (!instructor)
            throw new common_1.NotFoundException(`Instructor with ID '${id}' not found`);
        if (!userId || (instructor.userId !== userId && instructor.id !== userId)) {
            throw new common_1.ForbiddenException('You can only change your own affiliation');
        }
        if (!instructor.organizationId)
            throw new common_1.BadRequestException('You are not part of an organization');
        const courses = (await this.coursesRepo.find()).filter((c) => c.instructorId === id || (c.instructors || []).some((m) => m.id === id));
        const soleCourses = courses.filter((c) => (c.instructors || []).filter((m) => m.id !== id).length === 0);
        if (soleCourses.length) {
            throw new common_1.BadRequestException(`You are the only instructor of: ${soleCourses.map((c) => c.title).join(', ')}. Ask your organization to reassign these courses first.`);
        }
        for (const course of courses) {
            const team = (course.instructors || []).filter((m) => m.id !== id);
            const lead = team[0];
            await this.coursesRepo.update(course.id, {
                instructors: team,
                ...(course.instructorId === id
                    ? { instructorId: lead.id, instructorName: lead.name, leadInstructorName: lead.name }
                    : {}),
            });
        }
        const org = await this.orgsRepo.findById(instructor.organizationId);
        if (org) {
            await this.orgsRepo.update(org.id, { instructorIds: (org.instructorIds || []).filter((x) => x !== id) });
        }
        if (instructor.userId) {
            await this.usersRepo.update(instructor.userId, { organizationId: null, organizationName: null });
        }
        return this.instructorsRepo.update(id, {
            organizationId: null,
            organizationName: null,
            status: 'Pending Affiliation',
            orgJoinedAt: null,
        });
    }
};
exports.InstructorsService = InstructorsService;
exports.InstructorsService = InstructorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ORGANIZATIONS)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.USERS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], InstructorsService);
//# sourceMappingURL=instructors.service.js.map