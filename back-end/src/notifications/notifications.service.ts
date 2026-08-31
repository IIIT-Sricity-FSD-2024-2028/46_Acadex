import { Injectable, NotFoundException } from '@nestjs/common';
import { notifications } from '../data';

@Injectable()
export class NotificationsService {
  private notificationsList = [...notifications];

  findAll() {
    return this.notificationsList;
  }

  findOne(id: number) {
    const item = this.notificationsList.find((n) => n.id === id);
    if (!item) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return item;
  }

  create(dto: any) {
    const newItem = { id: Date.now(), ...dto, date: new Date().toISOString() };
    this.notificationsList.push(newItem);
    return newItem;
  }

  update(id: number, dto: any) {
    const item = this.findOne(id);
    const updated = { ...item, ...dto };
    this.notificationsList = this.notificationsList.map((n) => (n.id === id ? updated : n));
    return updated;
  }

  remove(id: number) {
    this.findOne(id);
    this.notificationsList = this.notificationsList.filter((n) => n.id !== id);
    return { success: true };
  }
}
