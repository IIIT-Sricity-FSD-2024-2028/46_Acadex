import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
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
