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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let AuthService = class AuthService {
    constructor(usersRepo, learnersRepo, instructorsRepo) {
        this.usersRepo = usersRepo;
        this.learnersRepo = learnersRepo;
        this.instructorsRepo = instructorsRepo;
        this.passwordResetCodes = new Map();
    }
    meetsPasswordCriteria(password) {
        return (/[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password) &&
            password.length >= 6);
    }
    ensurePasswordCriteria(password) {
        if (!this.meetsPasswordCriteria(password)) {
            throw new common_1.BadRequestException('Password must include an uppercase letter, lowercase letter, number, special symbol, and at least 6 characters');
        }
    }
    normalizeRole(role) {
        const value = String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
        return {
            learner: 'student',
            educator: 'instructor',
            faculty: 'instructor',
            org: 'organization',
            superadmin: 'superadmin',
        }[value] || value;
    }
    rolesMatch(accountRole, requestedRole) {
        if (!requestedRole)
            return true;
        const account = this.normalizeRole(accountRole);
        const requested = this.normalizeRole(requestedRole);
        if (account === requested)
            return true;
        if (account === 'superadmin' && requested === 'admin')
            return true;
        return false;
    }
    async login(dto) {
        this.ensurePasswordCriteria(dto.password);
        const user = await this.usersRepo.findOne({ email: dto.email });
        if (!user) {
            const learner = await this.learnersRepo.findOne({ email: dto.email });
            if (learner && this.rolesMatch('Student', dto.role)) {
                return {
                    token: `jwt-token-${learner.id}-${Date.now()}`,
                    user: {
                        id: learner.id,
                        name: learner.name,
                        email: learner.email,
                        role: 'Student',
                        avatar: learner.avatar,
                        university: learner.university,
                    },
                };
            }
            const inst = await this.instructorsRepo.findOne({ email: dto.email });
            if (inst && this.rolesMatch('Instructor', dto.role)) {
                return {
                    token: `jwt-token-${inst.id}-${Date.now()}`,
                    user: {
                        id: inst.userId || inst.id,
                        instructorId: inst.id,
                        name: inst.name,
                        email: inst.email,
                        role: 'Instructor',
                        avatar: inst.avatar,
                        organizationId: inst.organizationId || null,
                        organizationName: inst.organizationName || null,
                        status: inst.status || 'Pending Affiliation',
                    },
                };
            }
            throw new common_1.UnauthorizedException('Invalid email or password credentials');
        }
        if (user.password && user.password !== dto.password) {
            throw new common_1.UnauthorizedException('Invalid email or password credentials');
        }
        await this.usersRepo.update(user.id, { lastLogin: new Date().toISOString() });
        const normalizedAccount = this.normalizeRole(user.role);
        const normalizedRequested = this.normalizeRole(dto.role);
        let resolvedRole = user.role;
        if (normalizedAccount === 'superadmin') {
            resolvedRole = normalizedRequested === 'admin' ? 'Admin' : 'SuperAdmin';
        }
        let orgId = user.organizationId || null;
        let orgName = user.organizationName || null;
        let status = user.status || 'Active';
        let instructorId = null;
        if (user.role === 'Instructor') {
            const inst = (await this.instructorsRepo.findOne({ userId: user.id })) ||
                (await this.instructorsRepo.findOne({ email: user.email }));
            if (inst) {
                instructorId = inst.id;
                orgId = inst.organizationId || user.organizationId || null;
                orgName = inst.organizationName || user.organizationName || null;
                status = inst.status || user.status || 'Pending Affiliation';
            }
            else {
                status = user.organizationId ? 'Active' : 'Pending Affiliation';
            }
        }
        return {
            token: `jwt-token-${user.id}-${Date.now()}`,
            user: {
                id: user.id,
                instructorId,
                name: user.name,
                email: user.email,
                role: resolvedRole,
                avatar: user.avatar,
                verificationStatus: user.verificationStatus,
                organizationId: orgId,
                organizationName: orgName,
                status,
            },
        };
    }
    async register(dto) {
        this.ensurePasswordCriteria(dto.password);
        const existing = await this.usersRepo.findOne({ email: dto.email });
        if (existing) {
            throw new common_1.BadRequestException('A user with this email address already exists');
        }
        const initialStatus = dto.role === 'Instructor' ? 'Pending Affiliation' : 'Active';
        const newUser = await this.usersRepo.create({
            id: `usr-${Date.now()}`,
            name: dto.name,
            email: dto.email,
            password: dto.password,
            role: dto.role,
            status: initialStatus,
            verificationStatus: 'Verified',
            organizationId: null,
            organizationName: null,
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
            createdAt: new Date().toISOString(),
        });
        let instructorId = null;
        if (dto.role === 'Student') {
            await this.learnersRepo.create({
                id: `lrn-${Date.now()}`,
                userId: newUser.id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
                learnerType: 'Undergraduate',
                university: dto.university || 'General Open Enrollee',
                enrolledCourses: 0,
                overallProgress: 0,
                certificatesEarned: 0,
                status: 'Active',
            });
        }
        else if (dto.role === 'Instructor') {
            instructorId = `inst-${Date.now()}`;
            await this.instructorsRepo.create({
                id: instructorId,
                userId: newUser.id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
                educatorType: 'Faculty Instructor',
                specialization: dto.expertise || 'Computer Science',
                bio: 'Newly registered faculty educator on the platform.',
                status: 'Pending Affiliation',
                organizationId: null,
                organizationName: null,
                coursesCount: 0,
                enrolledStudents: 0,
                avgRating: 5.0,
                revenueGenerated: 0,
                createdAt: new Date().toISOString(),
            });
        }
        return {
            token: `jwt-token-${newUser.id}-${Date.now()}`,
            user: {
                ...newUser,
                instructorId,
                organizationId: null,
                organizationName: null,
                status: initialStatus,
            },
        };
    }
    async changePassword(userId, dto) {
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User session not found');
        }
        if (user.password && user.password !== dto.currentPassword) {
            throw new common_1.BadRequestException('Current password does not match');
        }
        await this.usersRepo.update(userId, { password: dto.newPassword });
        return { success: true, message: 'Password successfully updated' };
    }
    async requestPasswordReset(email) {
        const user = await this.usersRepo.findOne({ email });
        if (!user) {
            return { message: 'If an account exists for this email, a recovery code has been sent.' };
        }
        const code = process.env.RESET_CODE || '482910';
        this.passwordResetCodes.set(email.toLowerCase(), {
            code,
            expiresAt: Date.now() + 15 * 60 * 1000,
        });
        return {
            message: `Recovery code created. For local development, use ${code}.`,
        };
    }
    async confirmPasswordReset(dto) {
        const reset = this.passwordResetCodes.get(dto.email.toLowerCase());
        if (!reset || reset.expiresAt < Date.now() || reset.code !== dto.code) {
            throw new common_1.BadRequestException('The recovery code is invalid or has expired');
        }
        const user = await this.usersRepo.findOne({ email: dto.email });
        if (!user) {
            throw new common_1.BadRequestException('The recovery request is no longer valid');
        }
        await this.usersRepo.update(user.id, { password: dto.newPassword, updatedAt: new Date().toISOString() });
        this.passwordResetCodes.delete(dto.email.toLowerCase());
        return { success: true, message: 'Your password has been reset successfully.' };
    }
    async getMe(userId) {
        const user = await this.usersRepo.findById(userId);
        if (user) {
            if (user.role === 'Instructor') {
                const inst = (await this.instructorsRepo.findOne({ userId: user.id })) ||
                    (await this.instructorsRepo.findOne({ email: user.email }));
                return {
                    ...user,
                    instructorId: inst?.id || null,
                    organizationId: inst?.organizationId || user.organizationId || null,
                    organizationName: inst?.organizationName || user.organizationName || null,
                    status: inst?.status || user.status || 'Pending Affiliation',
                };
            }
            return user;
        }
        const learner = await this.learnersRepo.findById(userId);
        if (learner)
            return { ...learner, role: 'Student' };
        const inst = await this.instructorsRepo.findById(userId);
        if (inst) {
            return {
                ...inst,
                instructorId: inst.id,
                role: 'Instructor',
                organizationId: inst.organizationId || null,
                organizationName: inst.organizationName || null,
                status: inst.status || 'Pending Affiliation',
            };
        }
        return {
            id: userId,
            name: 'Authenticated User',
            role: 'Student',
            email: 'user@platform.io',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.USERS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map