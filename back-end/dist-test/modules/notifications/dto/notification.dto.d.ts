import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare class CreateNotificationDto {
    title: string;
    desc: string;
    category?: string;
    color?: string;
}
export declare class NotificationQueryDto extends PaginationQueryDto {
    unreadOnly?: boolean;
    category?: string;
}
