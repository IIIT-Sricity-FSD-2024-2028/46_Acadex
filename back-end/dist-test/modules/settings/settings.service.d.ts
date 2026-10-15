import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import { UpdateSettingsDto } from './dto/settings.dto';
export declare class SettingsService {
    private readonly settingsRepo;
    private readonly dbService;
    constructor(settingsRepo: JsonRepository<any>, dbService: JsonDatabaseService);
    getSettings(): Promise<any>;
    updateSettings(dto: UpdateSettingsDto): Promise<any>;
    resetDatabase(): Promise<{
        message: string;
        resetAt: string;
    }>;
    getBackup(): Promise<{
        snapshot: Record<string, any[]>;
        timestamp: string;
    }>;
}
