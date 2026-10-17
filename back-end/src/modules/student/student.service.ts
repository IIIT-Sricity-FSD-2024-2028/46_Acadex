import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UpdateStudentProfileDto, StudentCheckoutDto } from './dto/student.dto';
import { OrganizationService } from '../organization/organization.service';

const PAYMENT_METHODS = ['card', 'upi'];

@Injectable()
export class StudentService {
  constructor(
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATION)
    private readonly orgsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>,
    private readonly organizationService: OrganizationService,
  ) {}

  private async resolveLearner(userId: string) {
    if (userId) {
      let learner = await this.learnersRepo.findById(userId);
      if (!learner) {
        const all = await this.learnersRepo.find();
        learner = all.find((l) => l.userId === userId || l.email === userId || l.id === userId) || null;
      }
      if (learner) return learner;
    }
    throw new NotFoundException(`Learner '${userId || 'default'}' not found`);
  }

  private hasInstructor(course: any) {
    return Boolean(course?.instructorId || course?.instructors?.length);
  }

  private isAvailable(course: any) {
    return course && course.status === 'Published' && this.hasInstructor(course);
  }

  private lessonIdsFor(course: any): string[] {
    const ids: string[] = [];
    for (let mIdx = 0; mIdx < (course?.modules || []).length; mIdx++) {
      const mod = course.modules[mIdx];
      const modId = mod.id || `mod-${mIdx + 1}`;
      if (Array.isArray(mod.lessons)) {
        for (let i = 0; i < mod.lessons.length; i++) {
          const l = mod.lessons[i];
          const id = typeof l === 'object' && l ? (l.id || `${modId}-l${i + 1}`) : `${modId}-l${i + 1}`;
          ids.push(String(id));
        }
      } else if (Array.isArray(mod.items)) {
        for (let i = 0; i < mod.items.length; i++) {
          const it = mod.items[i];
          const id = typeof it === 'object' && it ? (it.id || `${modId}-l${i + 1}`) : `${modId}-l${i + 1}`;
          ids.push(String(id));
        }
      } else {
        const count = Number(mod.lessons) || (typeof mod.lessonsCount === 'number' ? mod.lessonsCount : 0);
        for (let i = 1; i <= count; i++) ids.push(`${modId}-l${i}`);
      }
    }
    return ids;
  }

  async getProfile(userId: string) {
    const learner = await this.resolveLearner(userId);
    const [enrollments, certificates] = await Promise.all([
      this.enrollmentsRepo.find({ where: { learnerId: learner.id } }),
      this.certificatesRepo.find({ where: { learnerId: learner.id } }),
    ]);
    const completed = enrollments.filter((e) => e.status === 'Completed').length;

    return {
      ...learner,
      enrolledCourses: enrollments.length,
      inProgressCourses: enrollments.length - completed,
      completedCourses: completed,
      certificatesEarned: certificates.length,
    };
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const learner = await this.resolveLearner(userId);
    const allowed: any = {};
    for (const key of ['name', 'title', 'location', 'bio', 'phone']) {
      if (dto[key] !== undefined) allowed[key] = String(dto[key]).trim();
    }
    if (allowed.name !== undefined && allowed.name.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }
    await this.learnersRepo.update(learner.id, { ...allowed, updatedAt: new Date().toISOString() });
    return this.getProfile(userId);
  }

  async requestJoinOrganization(userId: string, orgId: string, orgName: string) {
    const learner = await this.resolveLearner(userId);
    const org = await this.orgsRepo.findById(orgId);
    if (!org) throw new NotFoundException(`Organization '${orgId}' not found`);
    await this.learnersRepo.update(learner.id, {
      orgMembershipStatus: 'Pending Organization Approval',
      requestedOrgId: org.id,
      requestedOrgName: org.name || orgName,
      requestedAt: new Date().toISOString(),
    });
    return this.getProfile(userId);
  }

  async getOrganizationsList() {
    return this.orgsRepo.find();
  }

  async getCatalog() {
    const courses = await this.coursesRepo.find();
    return courses.filter((c) => this.isAvailable(c));
  }

  async getCatalogCourse(courseId: string) {
    const course = await this.coursesRepo.findById(courseId);
    if (!this.isAvailable(course)) throw new NotFoundException(`Course '${courseId}' is not available`);
    return course;
  }

  async getEnrollments(userId: string) {
    const learner = await this.resolveLearner(userId);
    const enrollments = await this.enrollmentsRepo.find({ where: { learnerId: learner.id } });
    const courses = await this.coursesRepo.find();

    const result = [];
    for (const enr of enrollments) {
      const course = courses.find((c) => c.id === enr.courseId);
      if (!course || !this.hasInstructor(course)) continue;

      const lessonIds = this.lessonIdsFor(course);
      const totalLessons = lessonIds.length;
      const completedLessons = Array.isArray(enr.completedLessons)
        ? enr.completedLessons.map(String).filter((id: string) => lessonIds.includes(id))
        : [];

      // Required progress calculation:
      // Progress = (Number of completed lessons / Total number of lessons) * 100
      const calculatedProgress = totalLessons > 0
        ? Math.min(100, Math.max(0, Math.round((completedLessons.length / totalLessons) * 100)))
        : 0;
      const calculatedStatus = calculatedProgress >= 100 ? 'Completed' : 'Active';

      // Synchronize stored enrollment if it has stale/mismatched progress (e.g. seeded with 60% with 0 lessons)
      if (enr.progress !== calculatedProgress || (enr.status === 'Completed' && calculatedProgress < 100)) {
        await this.enrollmentsRepo.update(enr.id, {
          progress: calculatedProgress,
          completedLessons,
          status: calculatedStatus,
        });
        enr.progress = calculatedProgress;
        enr.completedLessons = completedLessons;
        enr.status = calculatedStatus;
      }

      result.push({
        ...enr,
        courseTitle: course.title,
        category: course.category,
        description: course.description,
        thumbnail: course.thumbnail,
        institution: course.organizationName || '',
        instructorName: course.leadInstructorName || course.instructorName || '',
        totalLessons,
        completedLessons,
        progress: calculatedProgress,
        status: calculatedStatus,
      });
    }

    return result;
  }

  async getEnrollmentForCourse(userId: string, courseId: string) {
    const all = await this.getEnrollments(userId);
    const enrollment = all.find((e) => e.courseId === courseId);
    if (!enrollment) throw new NotFoundException('You are not enrolled in this course');
    return enrollment;
  }

  private async createEnrollment(learner: any, course: any) {
    const now = new Date();
    const enrollment = await this.enrollmentsRepo.create({
      id: `enr-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      learnerEmail: learner.email,
      courseId: course.id,
      courseTitle: course.title,
      organizationId: course.organizationId || null,
      instructorId: course.instructorId || course.instructors?.[0]?.id || null,
      enrolledDate: now.toISOString().split('T')[0],
      enrolledAt: now.toISOString(),
      progress: 0,
      status: 'Active',
      completedLessons: [],
      lastAccessedAt: null,
    });

    await this.coursesRepo.update(course.id, {
      enrolledCount: (course.enrolledCount || 0) + 1,
    });
    await this.organizationService.addEnrollmentRevenue(course);
    return enrollment;
  }

  private async assertNotEnrolled(learnerId: string, courseId: string) {
    const existing = await this.enrollmentsRepo.findOne({ learnerId, courseId });
    if (existing) throw new ConflictException('You are already enrolled in this course');
  }

  async enrollCourse(userId: string, courseId: string) {
    const learner = await this.resolveLearner(userId);
    const course = await this.getCatalogCourse(courseId);
    if (Number(course.price) > 0) {
      throw new BadRequestException('This is a paid course. Complete checkout to enroll.');
    }
    await this.assertNotEnrolled(learner.id, course.id);
    return this.createEnrollment(learner, course);
  }

  async updateProgress(userId: string, enrollmentId: string, lessonId: string, completed: boolean) {
    const learner = await this.resolveLearner(userId);
    const enrollment = await this.enrollmentsRepo.findById(enrollmentId);
    if (!enrollment) throw new NotFoundException(`Enrollment '${enrollmentId}' not found`);
    if (enrollment.learnerId !== learner.id) throw new ForbiddenException('Not your enrollment');

    const course = await this.coursesRepo.findById(enrollment.courseId);
    if (!course) throw new NotFoundException(`Course '${enrollment.courseId}' not found`);

    const lessonIds = this.lessonIdsFor(course);
    const targetLessonId = String(lessonId);
    if (!lessonIds.includes(targetLessonId)) {
      throw new BadRequestException(`Lesson '${lessonId}' does not belong to course '${course.title}'`);
    }

    const done = new Set<string>(
      (enrollment.completedLessons || []).map(String).filter((id: string) => lessonIds.includes(id))
    );
    if (completed) {
      done.add(targetLessonId);
    } else {
      done.delete(targetLessonId);
    }

    const completedLessons = Array.from(done);
    const totalLessons = lessonIds.length;
    const progress = totalLessons > 0 ? Math.min(100, Math.max(0, Math.round((completedLessons.length / totalLessons) * 100))) : 0;
    const nowCompleted = progress >= 100;
    const now = new Date().toISOString();

    await this.enrollmentsRepo.update(enrollmentId, {
      completedLessons,
      progress,
      status: nowCompleted ? 'Completed' : 'Active',
      lastAccessedAt: now,
      ...(nowCompleted && enrollment.status !== 'Completed' ? { completedAt: now } : {}),
    });

    if (nowCompleted) {
      await this.issueCertificate(learner, enrollment, course);
    }

    return this.getEnrollmentForCourse(userId, enrollment.courseId);
  }

  private async issueCertificate(learner: any, enrollment: any, course: any) {
    const existing = await this.certificatesRepo.findOne({ learnerId: learner.id, courseId: course.id });
    if (existing) return existing;

    const tag = course.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const credentialId = `NX-${tag}-${Math.floor(100000 + Math.random() * 900000)}`;
    const issuedAt = new Date();

    const cert = await this.certificatesRepo.create({
      id: `cert-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      courseId: course.id,
      courseTitle: course.title,
      institution: course.organizationName || '',
      organizationId: course.organizationId || null,
      instructorName: course.leadInstructorName || course.instructorName || '',
      category: course.category || '',
      skills: (course.modules || []).map((m: any) => m.title).slice(0, 4),
      issueDate: issuedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      issuedAt: issuedAt.toISOString(),
      credentialId,
      status: 'Verified',
      grade: 'Completed',
    });

    await this.enrollmentsRepo.update(enrollment.id, { certificateId: cert.credentialId });
    await this.notifsRepo.create({
      title: 'Course Completed',
      desc: `${learner.name} completed "${course.title}" and received a certificate.`,
      time: 'Just now',
      category: 'Certificate',
      read: false,
      color: 'green',
      learnerId: learner.id,
    });
    return cert;
  }

  async getCertificates(userId: string) {
    const learner = await this.resolveLearner(userId);
    return this.certificatesRepo.find({ where: { learnerId: learner.id } });
  }

  async getPayments(userId: string) {
    const learner = await this.resolveLearner(userId);
    const txs = await this.transactionsRepo.find({ where: { payerId: learner.id } });
    return txs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  async checkout(userId: string, dto: StudentCheckoutDto) {
    const learner = await this.resolveLearner(userId);
    const course = await this.getCatalogCourse(dto.courseId);

    // Idempotent checkout: if already enrolled, return existing enrollment & receipt details
    const existing = await this.enrollmentsRepo.findOne({ learnerId: learner.id, courseId: course.id });
    if (existing) {
      const existingTxn = await this.transactionsRepo.findOne({ payerId: learner.id, courseId: course.id });
      return {
        success: true,
        alreadyEnrolled: true,
        transactionId: existingTxn?.id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        enrollmentId: existing.id,
        courseId: course.id,
        courseTitle: course.title,
        amount: existingTxn?.amount || Number(course.price) || 0,
        method: existingTxn?.method || 'Card •••• 4242',
        date: existing.enrolledAt || new Date().toISOString(),
      };
    }

    const method = String(dto.paymentMethod || '').toLowerCase();
    if (!PAYMENT_METHODS.includes(method)) {
      throw new BadRequestException('Payment method must be card or upi');
    }
    if (method === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(dto.upiId || '')) {
      throw new BadRequestException('A valid UPI ID is required (e.g. name@bank)');
    }

    const sanitizedLast4 = String(dto.cardLast4 || '').replace(/\D/g, '').slice(-4);
    if (method === 'card' && !/^\d{4}$/.test(sanitizedLast4)) {
      throw new BadRequestException('Card details are incomplete or invalid');
    }

    const now = new Date().toISOString();
    const methodLabel = method === 'upi' ? `UPI (${dto.upiId})` : `Card •••• ${sanitizedLast4}`;
    const transaction = await this.transactionsRepo.create({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Payment',
      payerId: learner.id,
      payer: learner.name,
      courseId: course.id,
      course: course.title,
      organizationId: course.organizationId || null,
      organizationName: course.organizationName || null,
      amount: Number(course.price) || 0,
      method: methodLabel,
      date: now,
      status: 'Completed',
      createdAt: now,
      updatedAt: now,
    });

    const enrollment = await this.createEnrollment(learner, course);
    await this.coursesRepo.update(course.id, {
      revenue: (course.revenue || 0) + (Number(course.price) || 0),
    });

    return {
      success: true,
      transactionId: transaction.id,
      enrollmentId: enrollment.id,
      courseId: course.id,
      courseTitle: course.title,
      amount: transaction.amount,
      method: methodLabel,
      date: now,
    };
  }
}
