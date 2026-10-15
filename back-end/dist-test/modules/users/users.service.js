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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let UsersService = class UsersService {
    constructor(usersRepo, learnersRepo, instructorsRepo) {
        this.usersRepo = usersRepo;
        this.learnersRepo = learnersRepo;
        this.instructorsRepo = instructorsRepo;
    }
    async findAll(role) {
        const users = await this.usersRepo.find();
        if (!role)
            return users;
        const lower = role.toLowerCase();
        return users.filter((u) => u.role?.toLowerCase() === lower);
    }
    async findOne(id) {
        const user = await this.usersRepo.findById(id);
        if (!user) {
            const learner = await this.learnersRepo.findById(id);
            if (learner)
                return { ...learner, role: 'Student' };
            const instructor = await this.instructorsRepo.findById(id);
            if (instructor)
                return { ...instructor, role: 'Instructor' };
            throw new common_1.NotFoundException(`User with ID '${id}' not found`);
        }
        return user;
    }
    async create(dto) {
        const newUser = await this.usersRepo.create({
            id: `usr-${Date.now()}`,
            name: dto.name,
            email: dto.email,
            role: dto.role || 'Student',
            status: dto.status || 'Active',
            verificationStatus: dto.verificationStatus || 'Verified',
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
            createdAt: new Date().toISOString(),
        });
        return newUser;
    }
    async update(id, dto) {
        const updated = await this.usersRepo.update(id, dto);
        if (!updated) {
            throw new common_1.NotFoundException(`User with ID '${id}' not found`);
        }
        return updated;
    }
    async remove(id) {
        const deleted = await this.usersRepo.delete(id);
        if (!deleted) {
            throw new common_1.NotFoundException(`User with ID '${id}' not found`);
        }
        return { success: true, message: `User '${id}' removed` };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.USERS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map