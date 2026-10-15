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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let NotificationsService = class NotificationsService {
    constructor(notifsRepo) {
        this.notifsRepo = notifsRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, unreadOnly, category, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (unreadOnly)
            where.read = false;
        if (category && category !== 'All') {
            const cat = category.trim();
            const singular = cat.endsWith('s') ? cat.slice(0, -1) : cat;
            const plural = singular + 's';
            where.$or = [
                { category: cat },
                { category: singular },
                { category: plural },
            ];
        }
        if (search) {
            where.$or = [
                { title: { $contains: search } },
                { desc: { $contains: search } },
                { category: { $contains: search } },
            ];
        }
        return this.notifsRepo.findAndCount({
            where,
            skip,
            limit,
            sort: { [sortBy]: sortOrder },
        });
    }
    async getUnreadCount() {
        const count = await this.notifsRepo.count({ read: false });
        return { unreadCount: count };
    }
    async markAsRead(id) {
        const notif = await this.notifsRepo.findById(id);
        if (!notif) {
            throw new common_1.NotFoundException(`Notification with ID '${id}' not found`);
        }
        return this.notifsRepo.update(id, { read: true });
    }
    async markAllAsRead() {
        const updatedCount = await this.notifsRepo.updateMany({ read: false }, { read: true });
        return { markedCount: updatedCount };
    }
    async create(dto) {
        const nowIso = new Date().toISOString();
        return this.notifsRepo.create({
            id: `notif-${Date.now()}`,
            title: dto.title,
            desc: dto.desc,
            category: dto.category || 'System',
            time: 'Just now',
            read: false,
            color: dto.color || 'blue',
            createdAt: nowIso,
        });
    }
    async delete(id) {
        const notif = await this.notifsRepo.findById(id);
        if (!notif) {
            throw new common_1.NotFoundException(`Notification with ID '${id}' not found`);
        }
        return this.notifsRepo.delete(id);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.NOTIFICATIONS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map