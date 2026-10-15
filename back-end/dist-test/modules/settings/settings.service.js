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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
const json_db_service_1 = require("../../database/json-db.service");
let SettingsService = class SettingsService {
    constructor(settingsRepo, dbService) {
        this.settingsRepo = settingsRepo;
        this.dbService = dbService;
    }
    async getSettings() {
        const settingsList = await this.settingsRepo.find();
        if (settingsList.length === 0) {
            return this.settingsRepo.create({
                autoApproveEnrollments: true,
                emailAlerts: true,
                royaltyAlerts: true,
                weeklyDigest: false,
                requireTwoFactor: true,
                defaultCurrency: 'USD',
                defaultAccessType: 'Paid Masterclass',
            });
        }
        return settingsList[0];
    }
    async updateSettings(dto) {
        const current = await this.getSettings();
        return this.settingsRepo.update(current.id, dto);
    }
    async resetDatabase() {
        await this.dbService.resetAllCollections();
        return {
            message: 'JSON database was successfully restored to default seed datasets',
            resetAt: new Date().toISOString(),
        };
    }
    async getBackup() {
        const snapshot = await this.dbService.exportDatabaseSnapshot();
        return {
            snapshot,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.SETTINGS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_db_service_1.JsonDatabaseService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map