import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import {
  CreateDisputeDto,
  DisputePriority,
  DisputeQueryDto,
  DisputeRole,
  DisputeStatus,
  ResolveDisputeDto,
  UpdateDisputeStatusDto,
} from './dto/dispute.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class DisputesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.DISPUTES)
    private readonly disputesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATIONS)
    private readonly orgsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async findAll(query: DisputeQueryDto & { instructorId?: string; organizationId?: string }) {
    const { page = 1, limit = 100, search, status, priority, sortBy = 'createdAt', sortOrder = 'DESC', instructorId, organizationId } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (status && (status as any) !== 'All') where.status = status;
    if (priority && (priority as any) !== 'All') where.priority = priority;
    if (instructorId) where.instructorId = instructorId;
    if (organizationId) where.organizationId = organizationId;

    if (search) {
      where.$or = [
        { id: { $contains: search } },
        { subject: { $contains: search } },
        { raisedBy: { $contains: search } },
        { disputeType: { $contains: search } },
        { courseTitle: { $contains: search } },
        { course: { $contains: search } },
      ];
    }

    return this.disputesRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findMy(userId?: string) {
    const target = userId || 'usr-5';
    let learnerId = target;
    try {
      const allLearners = await this.learnersRepo.find();
      const match = allLearners.find((l) => l.userId === target || l.id === target || l.email === target);
      if (match?.id) learnerId = match.id;
    } catch {
      // fallback
    }

    const all = await this.disputesRepo.find();
    return all
      .filter(
        (d) =>
          d.raisedById === target ||
          d.raisedById === learnerId ||
          d.learnerId === learnerId ||
          d.learnerId === target ||
          d.studentId === learnerId ||
          d.studentId === target ||
          (target === 'usr-5' && (d.raisedBy === 'Arjun Sharma' || d.raisedById === 'lrn-1'))
      )
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }

  async findOne(id: string) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }
    return dispute;
  }

  async create(dto: CreateDisputeDto) {
    const year = new Date().getFullYear();
    const newId = `DSP-${year}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const raisedById = dto.raisedById || dto.learnerId || dto.studentId || dto.userId || 'usr-5';
    const raisedBy = dto.raisedBy || 'Arjun Sharma';
    const disputeType = dto.disputeType || dto.category || (dto as any).type || 'Course Content';
    let courseTitle = dto.courseTitle || dto.course || '';
    let instructorId = '';
    let instructorName = '';
    let organizationId = dto.organizationId || '';
    let organizationName = dto.organizationName || '';

    if (dto.courseId) {
      try {
        const course = await this.coursesRepo.findById(dto.courseId);
        if (course) {
          courseTitle = courseTitle || course.title || '';
          instructorId = course.instructorId || '';
          instructorName = course.instructorName || course.leadInstructorName || '';
          organizationId = organizationId || course.organizationId || '';
          organizationName = organizationName || course.organizationName || '';
        }
      } catch {
        // Course lookup fallback
      }
    }

    if (!organizationId && instructorId) {
      try {
        const inst = await this.instructorsRepo.findById(instructorId);
        if (inst) {
          organizationId = inst.organizationId || '';
          organizationName = inst.organizationName || '';
        }
      } catch {
        // Instructor lookup fallback
      }
    }

    const dispute = await this.disputesRepo.create({
      id: newId,
      raisedBy,
      raisedById,
      learnerId: raisedById,
      studentId: raisedById,
      raisedByRole: dto.raisedByRole || DisputeRole.STUDENT,
      raisedByType: dto.raisedByRole || 'Student',
      type: disputeType,
      disputeType,
      category: disputeType,
      subject: dto.subject,
      description: dto.description,
      course: courseTitle,
      courseTitle,
      courseId: dto.courseId || '',
      instructorId,
      instructorName,
      organizationId,
      organizationName,
      priority: dto.priority || DisputePriority.MEDIUM,
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
      resolvedAt: null,
      adminNotes: 'Ticket received by Acadex Operations and queued for review.',
      desiredResolution: dto.desiredResolution || 'Prompt review and resolution by platform council.',
      comments: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          type: 'created',
          message: `Dispute ticket ${newId} submitted by ${raisedBy}`,
          timestamp: nowIso,
        },
      ],
    });

    await this.notifsRepo.create({
      title: `New Dispute Ticket Raised: ${newId}`,
      desc: `Dispute regarding "${dispute.subject}" was logged for ${courseTitle || 'platform'}.`,
      time: 'Just now',
      category: 'Dispute',
      read: false,
      color: 'purple',
    });

    return dispute;
  }

  async updateStatus(id: string, dto: UpdateDisputeStatusDto) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }

    const isResolved = dto.status === DisputeStatus.RESOLVED || (dto.status as any) === 'Resolved';
    const nowIso = new Date().toISOString();

    return this.disputesRepo.update(id, {
      status: dto.status,
      resolvedAt: isResolved ? nowIso : dispute.resolvedAt,
      adminNotes: dto.adminNote
        ? `${dispute.adminNotes || ''} • ${dto.adminNote}`
        : dispute.adminNotes,
    });
  }

  async resolve(id: string, dto: any) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }

    const nowIso = new Date().toISOString();
    const resolutionNote = dto.resolutionNote || dto.adminNote || 'Resolved by administration.';
    const resolvedBy = dto.resolvedBy || 'Admin User';

    const timeline = Array.isArray(dispute.timeline) ? [...dispute.timeline] : [];
    timeline.push({
      id: `tl-${Date.now()}`,
      type: 'resolved',
      message: `Dispute resolved by ${resolvedBy}: ${resolutionNote}`,
      timestamp: nowIso,
    });

    const updated = await this.disputesRepo.update(id, {
      status: 'Resolved',
      resolvedAt: nowIso,
      resolutionNote,
      resolvedBy,
      adminNotes: `${dispute.adminNotes || ''} • Resolution: ${resolutionNote}`,
      timeline,
    });

    await this.notifsRepo.create({
      title: `Dispute Resolved: ${dispute.id}`,
      desc: `Ticket "${dispute.subject}" has been marked as Resolved by administration.`,
      time: 'Just now',
      category: 'Dispute',
      read: false,
      color: 'green',
    });

    return updated;
  }

  async reject(id: string, dto: any) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }

    const nowIso = new Date().toISOString();
    const rejectionReason = dto.rejectionReason || dto.reason || 'Rejected by administration.';
    const resolvedBy = dto.resolvedBy || 'Admin User';

    const timeline = Array.isArray(dispute.timeline) ? [...dispute.timeline] : [];
    timeline.push({
      id: `tl-${Date.now()}`,
      type: 'rejected',
      message: `Dispute rejected by ${resolvedBy}: ${rejectionReason}`,
      timestamp: nowIso,
    });

    const updated = await this.disputesRepo.update(id, {
      status: 'Rejected',
      resolvedAt: nowIso,
      rejectionReason,
      resolvedBy,
      adminNotes: `${dispute.adminNotes || ''} • Rejected: ${rejectionReason}`,
      timeline,
    });

    return updated;
  }

  async addComment(id: string, dto: any) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }

    const nowIso = new Date().toISOString();
    const comments = Array.isArray(dispute.comments) ? [...dispute.comments] : [];
    const newComment = {
      id: `com-${Date.now()}`,
      author: dto.author || 'Admin',
      message: dto.message || dto.comment || '',
      isAdmin: dto.isAdmin !== false,
      timestamp: nowIso,
    };
    comments.push(newComment);

    const timeline = Array.isArray(dispute.timeline) ? [...dispute.timeline] : [];
    timeline.push({
      id: `tl-${Date.now()}`,
      type: 'comment',
      message: `Note added by ${newComment.author}`,
      timestamp: nowIso,
    });

    return this.disputesRepo.update(id, { comments, timeline });
  }

  async delete(id: string) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }
    return this.disputesRepo.delete(id);
  }
}
