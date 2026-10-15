import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import {
  AssignCoursesToLearnersDto,
  EnrollmentQueryDto,
  UpdateEnrollmentProgressDto,
  UpdateEnrollmentStatusDto,
} from './dto/enrollment.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class EnrollmentsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>,
    private readonly dbService: JsonDatabaseService
  ) {}

  async findAll(query: EnrollmentQueryDto) {
    const { page = 1, limit = 10, search, learnerId, courseId, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (learnerId) where.learnerId = learnerId;
    if (courseId) where.courseId = courseId;
    if (status && status !== 'All') where.status = status;

    if (search) {
      where.$or = [
        { learnerName: { $contains: search } },
        { courseTitle: { $contains: search } },
        { id: { $contains: search } },
      ];
    }

    return this.enrollmentsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }
    return enrollment;
  }

  async createSingle(data: any) {
    const { learnerId, courseId, learnerName, courseTitle } = data;
    if (!learnerId || !courseId) {
      throw new BadRequestException('learnerId and courseId are required');
    }
    const existing = await this.enrollmentsRepo.find({ where: { learnerId, courseId } });
    if (existing.length > 0) {
      return existing[0];
    }
    const course = await this.coursesRepo.findById(courseId).catch(() => null);
    return this.enrollmentsRepo.create({
      learnerId,
      courseId,
      learnerName: learnerName || '',
      courseTitle: courseTitle || course?.title || '',
      status: 'Active',
      progress: 0,
      enrolledDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Atomic Multi-Course & Multi-Learner Assignment
   */
  async assignCoursesToLearners(dto: AssignCoursesToLearnersDto) {
    if (!dto.courseIds?.length || !dto.learnerIds?.length) {
      throw new BadRequestException('courseIds and learnerIds must not be empty');
    }

    return this.dbService.runTransaction(async () => {
      const allCourses = await this.coursesRepo.find();
      const allLearners = await this.learnersRepo.find();

      const targetCourses = allCourses.filter((c) => dto.courseIds.includes(c.id));
      const targetLearners = allLearners.filter((l) => dto.learnerIds.includes(l.id));

      if (targetCourses.length === 0) {
        throw new NotFoundException('None of the specified courses were found');
      }
      if (targetLearners.length === 0) {
        throw new NotFoundException('None of the specified learners were found');
      }

      const createdEnrollments = [];
      const createdTransactions = [];
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const nowIso = new Date().toISOString();

      for (const course of targetCourses) {
        if (!course.organizationId) {
          throw new BadRequestException(`Course "${course.title}" must belong to an organization before enrollment`);
        }
        if (!course.instructors?.length && !course.instructorId) {
          throw new BadRequestException(`Course "${course.title}" must have at least one instructor before enrollment`);
        }

        for (const learner of targetLearners) {
          // Check if already actively enrolled
          const existing = await this.enrollmentsRepo.findOne({
            learnerId: learner.id,
            courseId: course.id,
          });

          if (!existing) {
            const enrId = `ENR-${Math.floor(100000 + Math.random() * 900000)}`;
            const enrollment = await this.enrollmentsRepo.create({
              id: enrId,
              learnerId: learner.id,
              learnerName: learner.name,
              learnerAvatar: learner.avatar,
              courseId: course.id,
              courseTitle: course.title,
              enrolledDate: dateStr,
              progress: 0,
              status: 'Active',
              lastAccessed: dateStr,
              createdAt: nowIso,
            });
            createdEnrollments.push(enrollment);

            // Record transaction ledger entry
            const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
            const transaction = await this.transactionsRepo.create({
              id: txnId,
              payer: learner.name,
              payerId: learner.id,
              course: course.title,
              courseId: course.id,
              amount: course.price,
              type: 'Payment',
              organizationId: course.organizationId || null,
              organizationName: course.organizationName || null,
              method: course.organizationName ? `${course.organizationName} Billing` : 'Platform Billing',
              date: `${dateStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              status: 'Completed',
              createdAt: nowIso,
              updatedAt: nowIso,
            });
            createdTransactions.push(transaction);
          }
        }

        // Update Course seats and revenue
        const additionalSeats = targetLearners.length;
        await this.coursesRepo.update(course.id, {
          enrolledCount: (course.enrolledCount || 0) + additionalSeats,
          revenue: (course.revenue || 0) + course.price * additionalSeats,
        });
      }

      // Update Learners enrolled count
      for (const learner of targetLearners) {
        await this.learnersRepo.update(learner.id, {
          enrolledCourses: (learner.enrolledCourses || 0) + targetCourses.length,
          totalSpent: (learner.totalSpent || 0) + targetCourses.reduce((sum, c) => sum + c.price, 0),
        });
      }

      // Add Notification
      await this.notifsRepo.create({
        title: `Batch Course Assignment Completed`,
        desc: `Enrolled ${targetLearners.length} learner(s) into ${targetCourses.length} course track(s).`,
        time: 'Just now',
        category: 'Course',
        read: false,
        color: 'green',
      });

      return {
        totalAssigned: createdEnrollments.length,
        enrollments: createdEnrollments,
        transactions: createdTransactions,
      };
    });
  }

  async updateProgress(id: string, dto: UpdateEnrollmentProgressDto) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }

    const isCompleted = dto.progress >= 100;
    const updated = await this.enrollmentsRepo.update(id, {
      progress: dto.progress,
      status: isCompleted ? 'Completed' : enrollment.status,
      lastAccessed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    if (isCompleted && enrollment.status !== 'Completed') {
      const learner = await this.learnersRepo.findById(enrollment.learnerId);
      const course = await this.coursesRepo.findById(enrollment.courseId);

      if (learner) {
        await this.learnersRepo.update(learner.id, {
          completedCourses: (learner.completedCourses || 0) + 1,
          certificatesEarned: (learner.certificatesEarned || 0) + 1,
        });
      }

      // Auto-issue certificate on course completion
      const existingCert = await this.certificatesRepo.findOne({
        learnerId: enrollment.learnerId,
        courseId: enrollment.courseId,
      });

      if (!existingCert) {
        const tag = (enrollment.courseId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const rand = Math.floor(100000 + Math.random() * 900000);
        const credentialId = `NX-${tag}-${rand}`;
        const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const cert = await this.certificatesRepo.create({
          id: `cert-${Date.now()}`,
          learnerId: enrollment.learnerId,
          learnerName: enrollment.learnerName,
          courseId: enrollment.courseId,
          courseTitle: enrollment.courseTitle,
          institution: course?.organizationName || 'Platform',
          category: 'Course Certificates',
          issueDate,
          issuedAt: new Date().toISOString(),
          credentialId,
          status: 'Verified',
          grade: 'Completed',
          skills: course?.modules?.map((m: any) => m.title).slice(0, 4) || [],
          instructorSignature: course?.leadInstructorName || course?.instructorName || '',
          certificateUrl: `https://platform.io/verify/${credentialId}`,
        });

        await this.enrollmentsRepo.update(id, { certificateId: cert.credentialId });
      }

      await this.notifsRepo.create({
        title: 'Course Completed',
        desc: `${enrollment.learnerName} completed "${enrollment.courseTitle}" and received a certificate.`,
        time: 'Just now',
        category: 'Certificate',
        read: false,
        color: 'green',
      });
    }

    return updated;
  }

  async updateStatus(id: string, dto: UpdateEnrollmentStatusDto) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }
    return this.enrollmentsRepo.update(id, { status: dto.status });
  }

  async delete(id: string) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }
    return this.enrollmentsRepo.delete(id);
  }
}
