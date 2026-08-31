import { Injectable, NotFoundException } from '@nestjs/common';
import { refunds } from '../data';

@Injectable()
export class RefundsService {
  findAll() {
    return refunds;
  }

  findOne(id: string) {
    const refund = refunds.find(r => r.id === id);
    if (!refund) {
      throw new NotFoundException(`Refund #${id} not found`);
    }
    return refund;
  }

  update(id: string, updateData: Partial<{ status: string; reason?: string }>) {
    const index = refunds.findIndex(r => r.id === id);
    if (index === -1) {
      throw new NotFoundException(`Refund #${id} not found`);
    }
    refunds[index] = { ...refunds[index], ...updateData };
    return refunds[index];
  }
}
