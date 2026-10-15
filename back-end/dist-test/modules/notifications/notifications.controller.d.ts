import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(query: NotificationQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    getUnreadCount(): Promise<{
        unreadCount: number;
    }>;
    markRead(id: string): Promise<any>;
    markAllRead(): Promise<{
        markedCount: number;
    }>;
    create(dto: CreateNotificationDto): Promise<any>;
    delete(id: string): Promise<boolean>;
}
