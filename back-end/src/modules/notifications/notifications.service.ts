import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async findAll(query: NotificationQueryDto) {
    const { page = 1, limit = 20, search, unreadOnly, category, recipientId, role, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (unreadOnly) where.read = false;

    if (recipientId) {
      where.$or = [
        { recipientId },
        { recipientRole: role || 'instructor' },
        { recipientRole: 'all' },
      ];
    } else if (role) {
      where.$or = [
        { recipientRole: role },
        { recipientRole: 'all' },
      ];
    }

    if (category && category !== 'All') {
      const cat = category.trim();
      const singular = cat.endsWith('s') ? cat.slice(0, -1) : cat;
      const plural = singular + 's';
      const catFilters = [
        { category: cat },
        { category: singular },
        { category: plural },
      ];
      if (where.$or) {
        where.$and = [
          { $or: where.$or },
          { $or: catFilters },
        ];
        delete where.$or;
      } else {
        where.$or = catFilters;
      }
    }

    if (search) {
      const searchFilters = [
        { title: { $contains: search } },
        { desc: { $contains: search } },
        { category: { $contains: search } },
      ];
      if (where.$and) {
        where.$and.push({ $or: searchFilters });
      } else if (where.$or) {
        where.$and = [
          { $or: where.$or },
          { $or: searchFilters },
        ];
        delete where.$or;
      } else {
        where.$or = searchFilters;
      }
    }

    return this.notifsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async getUnreadCount(recipientId?: string, role?: string) {
    const where: QueryFilter<any> = { read: false };
    if (recipientId) {
      where.$or = [
        { recipientId },
        { recipientRole: role || 'instructor' },
        { recipientRole: 'all' },
      ];
    } else if (role) {
      where.$or = [
        { recipientRole: role },
        { recipientRole: 'all' },
      ];
    }
    const count = await this.notifsRepo.count(where);
    return { unreadCount: count };
  }

  async markAsRead(id: string) {
    const notif = await this.notifsRepo.findById(id);
    if (!notif) {
      throw new NotFoundException(`Notification with ID '${id}' not found`);
    }
    return this.notifsRepo.update(id, { read: true });
  }

  async markAllAsRead() {
    const updatedCount = await this.notifsRepo.updateMany({ read: false }, { read: true });
    return { markedCount: updatedCount };
  }

  async create(dto: CreateNotificationDto) {
    const nowIso = new Date().toISOString();
    return this.notifsRepo.create({
      id: `notif-${Date.now()}`,
      title: dto.title,
      desc: dto.desc,
      category: dto.category || 'System',
      time: 'Just now',
      read: false,
      color: dto.color || 'blue',
      recipientId: dto.recipientId,
      recipientRole: dto.recipientRole,
      courseId: dto.courseId,
      actionUrl: dto.actionUrl,
      createdAt: nowIso,
    });
  }

  async delete(id: string) {
    const notif = await this.notifsRepo.findById(id);
    if (!notif) {
      throw new NotFoundException(`Notification with ID '${id}' not found`);
    }
    return this.notifsRepo.delete(id);
  }
}
