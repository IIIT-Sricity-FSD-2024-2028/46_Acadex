import { Injectable, NotFoundException } from '@nestjs/common';
import { disputes } from '../data';

@Injectable()
export class DisputesService {
  private disputesList: any[] = disputes.map((d) => ({
    ...d,
    comments: d.comments ? [...d.comments] : [],
    timeline: d.timeline ? [...d.timeline] : [],
  }));

  findAll() {
    return this.disputesList;
  }

  findOne(id: string) {
    const dispute = this.disputesList.find((d) => d.id === id);
    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }
    return dispute;
  }

  getStats() {
    return {
      total: this.disputesList.length,
      pending: this.disputesList.filter((d) => d.status === 'Pending').length,
      resolved: this.disputesList.filter((d) => d.status === 'Resolved').length,
      rejected: this.disputesList.filter((d) => d.status === 'Rejected').length,
      inProgress: this.disputesList.filter((d) => d.status === 'In Progress').length,
    };
  }

  create(dto: any) {
    const now = new Date().toISOString();
    const newDispute = {
      id: `DSP-${Date.now()}`,
      ...dto,
      status: dto.status || 'Pending',
      createdAt: now,
      updatedAt: now,
      resolvedBy: null,
      resolvedAt: null,
      resolutionNote: null,
      rejectionReason: null,
      comments: [],
      timeline: [
        {
          event: 'Dispute Created',
          actor: dto.raisedBy || 'Unknown',
          date: now,
          type: 'created',
        },
      ],
    };
    this.disputesList.push(newDispute);
    return newDispute;
  }

  update(id: string, dto: any) {
    const dispute = this.findOne(id);
    const now = new Date().toISOString();
    const updated = { ...dispute, ...dto, updatedAt: now };
    this.disputesList = this.disputesList.map((d) => (d.id === id ? updated : d));
    return updated;
  }

  resolve(id: string, dto: { resolutionNote: string; resolvedBy?: string }) {
    const dispute = this.findOne(id);
    const now = new Date().toISOString();
    const updated = {
      ...dispute,
      status: 'Resolved',
      resolvedBy: dto.resolvedBy || 'Admin',
      resolvedAt: now,
      resolutionNote: dto.resolutionNote,
      updatedAt: now,
      timeline: [
        ...(dispute.timeline || []),
        {
          event: 'Dispute Resolved',
          actor: dto.resolvedBy || 'Admin',
          date: now,
          type: 'resolved',
        },
      ],
    };
    this.disputesList = this.disputesList.map((d) => (d.id === id ? updated : d));
    return updated;
  }

  reject(id: string, dto: { rejectionReason: string; resolvedBy?: string }) {
    const dispute = this.findOne(id);
    const now = new Date().toISOString();
    const updated = {
      ...dispute,
      status: 'Rejected',
      resolvedBy: dto.resolvedBy || 'Admin',
      resolvedAt: now,
      rejectionReason: dto.rejectionReason,
      updatedAt: now,
      timeline: [
        ...(dispute.timeline || []),
        {
          event: 'Dispute Rejected',
          actor: dto.resolvedBy || 'Admin',
          date: now,
          type: 'rejected',
        },
      ],
    };
    this.disputesList = this.disputesList.map((d) => (d.id === id ? updated : d));
    return updated;
  }

  addComment(id: string, dto: { author: string; message: string; isAdmin?: boolean }) {
    const dispute = this.findOne(id);
    const now = new Date().toISOString();
    const comment = {
      id: `C-${Date.now()}`,
      author: dto.author || 'Admin',
      message: dto.message,
      isAdmin: dto.isAdmin !== undefined ? dto.isAdmin : true,
      timestamp: now,
    };
    const updatedComments = [...(dispute.comments || []), comment];
    const updatedTimeline = [
      ...(dispute.timeline || []),
      {
        event: dto.isAdmin === false ? 'User comment added' : 'Admin comment added',
        actor: dto.author || 'Admin',
        date: now,
        type: 'comment',
      },
    ];
    const updated = {
      ...dispute,
      comments: updatedComments,
      timeline: updatedTimeline,
      updatedAt: now,
    };
    this.disputesList = this.disputesList.map((d) => (d.id === id ? updated : d));
    return updated;
  }

  updatePriority(id: string, dto: { priority: string }) {
    const dispute = this.findOne(id);
    const now = new Date().toISOString();
    const updated = {
      ...dispute,
      priority: dto.priority,
      updatedAt: now,
      timeline: [
        ...(dispute.timeline || []),
        {
          event: `Priority changed to ${dto.priority}`,
          actor: 'Admin',
          date: now,
          type: 'priority',
        },
      ],
    };
    this.disputesList = this.disputesList.map((d) => (d.id === id ? updated : d));
    return updated;
  }

  remove(id: string) {
    this.findOne(id);
    this.disputesList = this.disputesList.filter((d) => d.id !== id);
    return { success: true };
  }
}
