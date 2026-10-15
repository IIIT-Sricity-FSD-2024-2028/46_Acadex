import { JsonRepository } from '../../database/json-repository';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
export declare class NotificationsService {
    private readonly notifsRepo;
    constructor(notifsRepo: JsonRepository<any>);
    findAll(query: NotificationQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    getUnreadCount(): Promise<{
        unreadCount: number;
    }>;
    markAsRead(id: string): Promise<any>;
    markAllAsRead(): Promise<{
        markedCount: number;
    }>;
    create(dto: CreateNotificationDto): Promise<any>;
    delete(id: string): Promise<boolean>;
}
