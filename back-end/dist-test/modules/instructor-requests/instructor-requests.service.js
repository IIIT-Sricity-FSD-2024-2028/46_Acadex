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
exports.InstructorRequestsService = exports.JOIN_STATUS = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
const instructor_request_dto_1 = require("./dto/instructor-request.dto");
exports.JOIN_STATUS = {
    PENDING: 'Pending Organization Approval',
    APPROVED: 'Approved by Organization',
    REJECTED: 'Rejected by Organization',
    CANCELLED: 'Cancelled by Instructor',
};
const isPending = (status) => /pending|sent/i.test(status || '');
const isJoin = (r) => r?.type === 'join';
let InstructorRequestsService = class InstructorRequestsService {
    constructor(requestsRepo, instructorsRepo, coursesRepo, notifsRepo, orgsRepo, usersRepo) {
        this.requestsRepo = requestsRepo;
        this.instructorsRepo = instructorsRepo;
        this.coursesRepo = coursesRepo;
        this.notifsRepo = notifsRepo;
        this.orgsRepo = orgsRepo;
        this.usersRepo = usersRepo;
    }
    async instructorForUser(userId) {
        if (!userId)
            throw new common_1.BadRequestException('Missing x-user-id header');
        const all = await this.instructorsRepo.find();
        const instructor = all.find((i) => i.userId === userId || i.id === userId);
        if (!instructor)
            throw new common_1.ForbiddenException('Only instructors can perform this action');
        return instructor;
    }
    async orgForAdmin(userEmail) {
        if (!userEmail)
            throw new common_1.BadRequestException('Missing x-user-email header');
        const orgs = await this.orgsRepo.find();
        const org = orgs.find((o) => o.email?.toLowerCase() === userEmail.toLowerCase());
        if (!org)
            throw new common_1.ForbiddenException('Only organization admins can perform this action');
        return org;
    }
    isAffiliated(instructor) {
        return Boolean(instructor?.organizationId) && instructor.status === 'Active';
    }
    async affiliate(instructor, org) {
        const now = new Date().toISOString();
        await this.instructorsRepo.update(instructor.id, {
            organizationId: org.id,
            organizationName: org.name,
            status: 'Active',
            orgJoinedAt: now,
        });
        const user = instructor.userId
            ? await this.usersRepo.findById(instructor.userId)
            : await this.usersRepo.findOne({ email: instructor.email });
        if (user) {
            await this.usersRepo.update(user.id, { organizationId: org.id, organizationName: org.name, status: 'Active' });
        }
        const roster = org.instructorIds || [];
        if (!roster.includes(instructor.id)) {
            await this.orgsRepo.update(org.id, { instructorIds: [...roster, instructor.id] });
        }
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, instructorId, email, organizationId, type, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const where = {};
        if (instructorId)
            where.instructorId = instructorId;
        if (organizationId)
            where.organizationId = organizationId;
        if (email)
            where.email = { $contains: email };
        if (status && status !== 'All') {
            const s = status.toLowerCase();
            if (s.includes('pending'))
                where.status = { $regex: /pending|sent/i };
            else if (s.includes('accepted') || s.includes('approved'))
                where.status = { $regex: /accepted|approved/i };
            else if (s.includes('declined') || s.includes('rejected'))
                where.status = { $regex: /declined|rejected/i };
            else
                where.status = status;
        }
        if (search) {
            where.$or = [
                { name: { $contains: search } },
                { email: { $contains: search } },
                { courseTitle: { $contains: search } },
                { specialization: { $contains: search } },
            ];
        }
        if (!type) {
            return this.requestsRepo.findAndCount({ where, skip: (page - 1) * limit, limit, sort: { [sortBy]: sortOrder } });
        }
        const all = (await this.requestsRepo.findAndCount({ where, sort: { [sortBy]: sortOrder } })).items.filter((r) => type === 'join' ? isJoin(r) : !isJoin(r));
        const totalPages = Math.ceil(all.length / limit) || 1;
        return {
            items: all.slice((page - 1) * limit, page * limit),
            total: all.length,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }
    async findOne(id) {
        const request = await this.requestsRepo.findById(id);
        if (!request)
            throw new common_1.NotFoundException(`Request '${id}' not found`);
        return request;
    }
    async create(dto) {
        const instructor = await this.instructorsRepo.findById(dto.instructorId);
        if (!instructor)
            throw new common_1.NotFoundException(`Instructor '${dto.instructorId}' not found`);
        if (!dto.organizationId)
            throw new common_1.BadRequestException('organizationId is required');
        const org = await this.orgsRepo.findById(dto.organizationId);
        if (!org)
            throw new common_1.NotFoundException(`Organization '${dto.organizationId}' not found`);
        if (this.isAffiliated(instructor) && instructor.organizationId !== org.id) {
            throw new common_1.BadRequestException(`${instructor.name} is already affiliated with ${instructor.organizationName}`);
        }
        let courseTitle = dto.courseTitle;
        if (dto.courseId) {
            const course = await this.coursesRepo.findById(dto.courseId);
            if (!course)
                throw new common_1.NotFoundException(`Course '${dto.courseId}' not found`);
            if (course.organizationId && course.organizationId !== org.id) {
                throw new common_1.ForbiddenException('This course belongs to another organization');
            }
            courseTitle = course.title;
        }
        if (!courseTitle)
            throw new common_1.BadRequestException('courseId or courseTitle is required');
        const duplicate = (await this.requestsRepo.find({ where: { instructorId: instructor.id, organizationId: org.id } })).find((r) => !isJoin(r) && isPending(r.status) && (r.courseId || r.courseTitle) === (dto.courseId || courseTitle));
        if (duplicate)
            throw new common_1.ConflictException('A pending invitation for this course already exists');
        const now = new Date();
        const request = await this.requestsRepo.create({
            type: 'invitation',
            instructorId: instructor.id,
            courseId: dto.courseId || null,
            organizationId: org.id,
            organizationName: org.name,
            name: instructor.name,
            email: instructor.email,
            avatar: instructor.avatar,
            specialization: instructor.specialization,
            courseTitle,
            semester: dto.semester || null,
            creditHours: dto.creditHours || null,
            proposedTerms: dto.proposedTerms || null,
            description: dto.message || '',
            submittedDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            status: 'Pending Professor Response',
            trackingStatus: `Awaiting decision from ${instructor.name}`,
        });
        await this.notifsRepo.create({
            title: `Teaching invitation sent to ${instructor.name}`,
            desc: `${org.name} invited ${instructor.name} to teach "${courseTitle}".`,
            time: 'Just now',
            category: 'Instructor',
            read: false,
            color: 'blue',
            organizationId: org.id,
            instructorId: instructor.id,
        });
        return request;
    }
    async respond(id, dto) {
        const request = await this.findOne(id);
        if (isJoin(request))
            throw new common_1.BadRequestException('Join requests are decided by the organization');
        if (!isPending(request.status))
            throw new common_1.BadRequestException('This invitation has already been resolved');
        const instructor = await this.instructorsRepo.findById(request.instructorId);
        if (!instructor)
            throw new common_1.NotFoundException('Instructor no longer exists');
        const accepted = dto.decision === instructor_request_dto_1.TeachingRequestDecision.ACCEPTED;
        if (accepted && this.isAffiliated(instructor) && instructor.organizationId !== request.organizationId) {
            throw new common_1.BadRequestException(`Leave ${instructor.organizationName} before accepting an invitation from another organization`);
        }
        const updated = await this.requestsRepo.update(id, {
            status: accepted ? 'Accepted by Professor' : 'Declined by Professor',
            trackingStatus: accepted ? 'Accepted — instructor added to course' : 'Declined by instructor',
            respondedAt: new Date().toISOString(),
            instructorNotes: dto.notes || null,
        });
        if (accepted) {
            const org = await this.orgsRepo.findById(request.organizationId);
            if (org)
                await this.affiliate(instructor, org);
            const course = request.courseId ? await this.coursesRepo.findById(request.courseId) : null;
            if (course) {
                const team = course.instructors || [];
                if (!team.some((m) => m.id === instructor.id)) {
                    const role = team.length === 0 ? 'Lead Instructor' : 'Co-Instructor';
                    await this.coursesRepo.update(course.id, {
                        instructors: [...team, { id: instructor.id, name: instructor.name, role, avatar: instructor.avatar, specialization: instructor.specialization }],
                        ...(team.length === 0
                            ? { instructorId: instructor.id, instructorName: instructor.name, leadInstructorName: instructor.name }
                            : {}),
                    });
                    await this.instructorsRepo.update(instructor.id, { coursesCount: (instructor.coursesCount || 0) + 1 });
                }
            }
        }
        await this.notifsRepo.create({
            title: accepted ? `${request.name} accepted your invitation` : `${request.name} declined your invitation`,
            desc: `Teaching invitation for "${request.courseTitle}".`,
            time: 'Just now',
            category: 'Instructor',
            read: false,
            color: accepted ? 'green' : 'amber',
            organizationId: request.organizationId,
        });
        return updated;
    }
    async withdraw(id, dto) {
        const request = await this.findOne(id);
        if (isJoin(request))
            throw new common_1.BadRequestException('Use the join-request endpoints');
        if (!isPending(request.status))
            throw new common_1.BadRequestException('Only pending invitations can be withdrawn');
        return this.requestsRepo.update(id, {
            status: 'Withdrawn by Organization',
            trackingStatus: dto.reason ? `Withdrawn: ${dto.reason}` : 'Withdrawn by organization',
        });
    }
    async resend(id) {
        const request = await this.findOne(id);
        if (isJoin(request) || !isPending(request.status)) {
            throw new common_1.BadRequestException('Only pending invitations can be resent');
        }
        const updated = await this.requestsRepo.update(id, {
            lastReminderAt: new Date().toISOString(),
            trackingStatus: `Reminder sent to ${request.email}`,
        });
        await this.notifsRepo.create({
            title: `Reminder sent to ${request.name}`,
            desc: `Reminder for the "${request.courseTitle}" teaching invitation.`,
            time: 'Just now',
            category: 'Instructor',
            read: false,
            color: 'blue',
            organizationId: request.organizationId,
            instructorId: request.instructorId,
        });
        return updated;
    }
    async delete(id) {
        await this.findOne(id);
        return this.requestsRepo.delete(id);
    }
    async myJoinRequests(userId) {
        const instructor = await this.instructorForUser(userId);
        const all = await this.requestsRepo.find({ where: { instructorId: instructor.id } });
        return all.filter(isJoin).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    async createJoinRequest(userId, dto) {
        const instructor = await this.instructorForUser(userId);
        if (this.isAffiliated(instructor)) {
            throw new common_1.BadRequestException(`You are already a member of ${instructor.organizationName}. Leave it first.`);
        }
        const org = await this.orgsRepo.findById(dto.organizationId);
        if (!org)
            throw new common_1.NotFoundException(`Organization '${dto.organizationId}' not found`);
        const existing = (await this.requestsRepo.find({ where: { instructorId: instructor.id } })).filter((r) => isJoin(r) && isPending(r.status));
        if (existing.length) {
            throw new common_1.ConflictException(`You already have a pending request with ${existing[0].organizationName}`);
        }
        const request = await this.requestsRepo.create({
            type: 'join',
            instructorId: instructor.id,
            organizationId: org.id,
            organizationName: org.name,
            name: instructor.name,
            email: instructor.email,
            avatar: instructor.avatar,
            specialization: instructor.specialization,
            description: (dto.message || '').trim(),
            status: exports.JOIN_STATUS.PENDING,
            submittedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        });
        await this.notifsRepo.create({
            title: `Join request from ${instructor.name}`,
            desc: `${instructor.name} asked to join ${org.name} as an instructor.`,
            time: 'Just now',
            category: 'Instructor',
            read: false,
            color: 'blue',
            organizationId: org.id,
        });
        return request;
    }
    async cancelJoinRequest(userId, id) {
        const instructor = await this.instructorForUser(userId);
        const request = await this.findOne(id);
        if (!isJoin(request) || request.instructorId !== instructor.id)
            throw new common_1.ForbiddenException('Not your join request');
        if (!isPending(request.status))
            throw new common_1.BadRequestException('This request has already been decided');
        return this.requestsRepo.update(id, { status: exports.JOIN_STATUS.CANCELLED, decidedAt: new Date().toISOString() });
    }
    async orgJoinRequests(userEmail) {
        const org = await this.orgForAdmin(userEmail);
        const all = await this.requestsRepo.find({ where: { organizationId: org.id } });
        return all.filter(isJoin).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    async decideJoinRequest(userEmail, id, dto) {
        const org = await this.orgForAdmin(userEmail);
        const request = await this.findOne(id);
        if (!isJoin(request) || request.organizationId !== org.id) {
            throw new common_1.ForbiddenException('This request was not sent to your organization');
        }
        if (!isPending(request.status))
            throw new common_1.BadRequestException('This request has already been decided');
        const instructor = await this.instructorsRepo.findById(request.instructorId);
        if (!instructor)
            throw new common_1.NotFoundException('Instructor no longer exists');
        const approve = dto.action === 'approve';
        if (approve && this.isAffiliated(instructor) && instructor.organizationId !== org.id) {
            throw new common_1.BadRequestException(`${instructor.name} has since joined ${instructor.organizationName}`);
        }
        const updated = await this.requestsRepo.update(id, {
            status: approve ? exports.JOIN_STATUS.APPROVED : exports.JOIN_STATUS.REJECTED,
            decidedAt: new Date().toISOString(),
            orgNotes: dto.notes || null,
        });
        if (approve)
            await this.affiliate(instructor, org);
        await this.notifsRepo.create({
            title: approve ? `${org.name} approved your join request` : `${org.name} declined your join request`,
            desc: approve ? `You are now an instructor at ${org.name}.` : dto.notes || 'Your request to join was not approved.',
            time: 'Just now',
            category: 'Instructor',
            read: false,
            color: approve ? 'green' : 'amber',
            instructorId: instructor.id,
        });
        return updated;
    }
};
exports.InstructorRequestsService = InstructorRequestsService;
exports.InstructorRequestsService = InstructorRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.NOTIFICATIONS)),
    __param(4, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ORGANIZATIONS)),
    __param(5, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.USERS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], InstructorRequestsService);
//# sourceMappingURL=instructor-requests.service.js.map