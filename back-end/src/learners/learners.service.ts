import { Injectable, NotFoundException } from '@nestjs/common';
import { learners } from '../data';

@Injectable()
export class LearnersService {
  private learnersList = [...learners];

  findAll() {
    return this.learnersList;
  }

  findOne(id: number) {
    const learner = this.learnersList.find((l) => l.id === id);
    if (!learner) {
      throw new NotFoundException(`Learner with ID ${id} not found`);
    }
    return learner;
  }

  create(dto: any) {
    const newLearner = { id: Date.now(), ...dto };
    this.learnersList.push(newLearner);
    return newLearner;
  }

  update(id: number, dto: any) {
    const learner = this.findOne(id);
    const updated = { ...learner, ...dto };
    this.learnersList = this.learnersList.map((l) => (l.id === id ? updated : l));
    return updated;
  }

  remove(id: number) {
    this.findOne(id);
    this.learnersList = this.learnersList.filter((l) => l.id !== id);
    return { success: true };
  }
}
