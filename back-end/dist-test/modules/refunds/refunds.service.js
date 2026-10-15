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
exports.RefundsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let RefundsService = class RefundsService {
    constructor(refundsRepo, transactionsRepo) {
        this.refundsRepo = refundsRepo;
        this.transactionsRepo = transactionsRepo;
    }
    async findAll() {
        return this.refundsRepo.find();
    }
    async findOne(id) {
        const ref = await this.refundsRepo.findById(id);
        if (!ref) {
            throw new common_1.NotFoundException(`Refund '${id}' not found`);
        }
        return ref;
    }
    async create(data) {
        const refund = await this.refundsRepo.create({
            id: `ref-${Date.now()}`,
            status: 'Processed',
            date: new Date().toISOString().split('T')[0],
            ...data,
        });
        if (data.transactionId) {
            await this.transactionsRepo.update(data.transactionId, { status: 'Refunded' });
        }
        return refund;
    }
    async update(id, data) {
        const updated = await this.refundsRepo.update(id, data);
        if (!updated) {
            throw new common_1.NotFoundException(`Refund '${id}' not found`);
        }
        return updated;
    }
};
exports.RefundsService = RefundsService;
exports.RefundsService = RefundsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.REFUNDS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.TRANSACTIONS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], RefundsService);
//# sourceMappingURL=refunds.service.js.map