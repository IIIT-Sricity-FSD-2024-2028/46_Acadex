import { Injectable, NotFoundException } from '@nestjs/common';
import { enrollments } from '../data';

@Injectable()
export class EnrollmentsService {
  private enrollmentsList = [...enrollments];

  findAll() {
    return this.enrollmentsList;
  }

  findOne(id: number) {
    const item = this.enrollmentsList.find((e) => e.id === id);
    if (!item) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return item;
  }

  create(dto: any) {
    const newItem = { id: Date.now(), ...dto };
    this.enrollmentsList.push(newItem);
    return newItem;
  }

  update(id: number, dto: any) {
    const item = this.findOne(id);
    const updated = { ...item, ...dto };
    this.enrollmentsList = this.enrollmentsList.map((e) => (e.id === id ? updated : e));
    return updated;
  }

  remove(id: number) {
    this.findOne(id);
    this.enrollmentsList = this.enrollmentsList.filter((e) => e.id !== id);
    return { success: true };
  }
}
