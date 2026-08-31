import { Injectable, NotFoundException } from '@nestjs/common';
import { transactions } from '../data';

@Injectable()
export class TransactionsService {
  private transactionsList = [...transactions];

  findAll() {
    return this.transactionsList;
  }

  findOne(id: string) {
    const item = this.transactionsList.find((t) => t.id === id);
    if (!item) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return item;
  }

  create(dto: any) {
    const newItem = { id: `TXN-${Date.now()}`, ...dto };
    this.transactionsList.push(newItem);
    return newItem;
  }

  update(id: string, dto: any) {
    const item = this.findOne(id);
    const updated = { ...item, ...dto };
    this.transactionsList = this.transactionsList.map((t) => (t.id === id ? updated : t));
    return updated;
  }

  remove(id: string) {
    this.findOne(id);
    this.transactionsList = this.transactionsList.filter((t) => t.id !== id);
    return { success: true };
  }
}
