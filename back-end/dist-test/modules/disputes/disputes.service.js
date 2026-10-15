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
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
const dispute_dto_1 = require("./dto/dispute.dto");
let DisputesService = class DisputesService {
    constructor(disputesRepo, notifsRepo) {
        this.disputesRepo = disputesRepo;
        this.notifsRepo = notifsRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, priority, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status && status !== 'All')
            where.status = status;
        if (priority && priority !== 'All')
            where.priority = priority;
        if (search) {
            where.$or = [
                { id: { $contains: search } },
                { subject: { $contains: search } },
                { raisedBy: { $contains: search } },
                { disputeType: { $contains: search } },
                { courseTitle: { $contains: search } },
            ];
        }
        return this.disputesRepo.findAndCount({
            where,
            skip,
            limit,
            sort: { [sortBy]: sortOrder },
        });
    }
    async findOne(id) {
        const dispute = await this.disputesRepo.findById(id);
        if (!dispute) {
            throw new common_1.NotFoundException(`Dispute ticket with ID '${id}' not found`);
        }
        return dispute;
    }
    async create(dto) {
        if (dto.raisedByRole && dto.raisedByRole !== dispute_dto_1.DisputeRole.LEARNER) {
            throw new common_1.BadRequestException('Only learners can raise disputes');
        }
        const year = new Date().getFullYear();
        const newId = `DSP-${year}-${Math.floor(100 + Math.random() * 900)}`;
        const nowIso = new Date().toISOString();
        const dispute = await this.disputesRepo.create({
            id: newId,
            raisedBy: dto.raisedBy,
            raisedById: dto.raisedById,
            raisedByRole: dispute_dto_1.DisputeRole.LEARNER,
            disputeType: dto.disputeType,
            subject: dto.subject,
            description: dto.description,
            courseTitle: dto.courseTitle || '',
            courseId: dto.courseId || '',
            priority: dto.priority || 'Medium',
            status: dispute_dto_1.DisputeStatus.OPEN,
            createdAt: nowIso,
            resolvedAt: null,
            adminNotes: 'Ticket created and dispatched to Governance and Academic Council.',
            desiredResolution: dto.desiredResolution || 'Prompt review and resolution by administration.',
        });
        await this.notifsRepo.create({
            title: `New Dispute Ticket Raised: ${newId}`,
            desc: `Dispute regarding "${dispute.subject}" was logged by ${dispute.raisedBy}.`,
            time: 'Just now',
            category: 'Dispute',
            read: false,
            color: 'purple',
        });
        return dispute;
    }
    async updateStatus(id, dto) {
        const dispute = await this.disputesRepo.findById(id);
        if (!dispute) {
            throw new common_1.NotFoundException(`Dispute ticket with ID '${id}' not found`);
        }
        const isResolved = dto.status === dispute_dto_1.DisputeStatus.RESOLVED;
        const nowIso = new Date().toISOString();
        return this.disputesRepo.update(id, {
            status: dto.status,
            resolvedAt: isResolved ? nowIso : dispute.resolvedAt,
            adminNotes: dto.adminNote
                ? `${dispute.adminNotes || ''} • ${dto.adminNote}`
                : dispute.adminNotes,
        });
    }
    async resolve(id, dto) {
        const dispute = await this.disputesRepo.findById(id);
        if (!dispute) {
            throw new common_1.NotFoundException(`Dispute ticket with ID '${id}' not found`);
        }
        const nowIso = new Date().toISOString();
        const updated = await this.disputesRepo.update(id, {
            status: dispute_dto_1.DisputeStatus.RESOLVED,
            resolvedAt: nowIso,
            adminNotes: `${dispute.adminNotes || ''} • Resolution: ${dto.resolutionNote}`,
        });
        await this.notifsRepo.create({
            title: `Dispute Resolved: ${dispute.id}`,
            desc: `Ticket "${dispute.subject}" has been marked as Resolved by administration.`,
            time: 'Just now',
            category: 'Dispute',
            read: false,
            color: 'green',
        });
        return updated;
    }
    async delete(id) {
        const dispute = await this.disputesRepo.findById(id);
        if (!dispute) {
            throw new common_1.NotFoundException(`Dispute ticket with ID '${id}' not found`);
        }
        return this.disputesRepo.delete(id);
    }
};
exports.DisputesService = DisputesService;
exports.DisputesService = DisputesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.DISPUTES)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.NOTIFICATIONS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], DisputesService);
//# sourceMappingURL=disputes.service.js.map