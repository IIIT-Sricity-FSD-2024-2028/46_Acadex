import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UpdateStudentProfileDto, StudentCheckoutDto } from './dto/student.dto';

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
    private readonly orgsRepo: JsonRepository<any>
  ) {}

  async getProfile(userId: string) {
    let learner = await this.learnersRepo.findById(userId);
    if (!learner) {
      const all = await this.learnersRepo.find();
      learner = all.find((l) => l.userId === userId || l.email === userId) || null;
    }
    if (!learner) {
      throw new NotFoundException(`Learner '${userId}' not found`);
    }

    if (!learner.orgMembershipStatus) {
      learner.orgMembershipStatus = learner.university && learner.university !== 'Independent Learner' 
        ? 'Verified Student' 
        : 'Independent Learner';
    }

    return learner;
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const learner = await this.getProfile(userId);
    const updated = await this.learnersRepo.update(learner.id, dto);
    return updated;
  }

  async requestJoinOrganization(userId: string, orgId: string, orgName: string) {
    const learner = await this.getProfile(userId);
    const updated = await this.learnersRepo.update(learner.id, {
      orgMembershipStatus: 'Pending Organization Approval',
      requestedOrgId: orgId,
      requestedOrgName: orgName,
      requestedAt: new Date().toISOString(),
    });
    return updated;
  }

  async getOrganizationsList() {
    return this.orgsRepo.find();
  }

  async getEnrollments(userId: string) {
    const learner = await this.getProfile(userId);
    const enrollments = await this.enrollmentsRepo.find({
      where: { learnerId: learner.id },
    });
    const allCourses = await this.coursesRepo.find();
    
    // Enrich with accurate course thumbnail and metadata
    const enriched = enrollments.map((enr) => {
      const course = allCourses.find((c) => c.id === enr.courseId || c.title?.toLowerCase() === enr.courseTitle?.toLowerCase());
      const resolvedThumbnail = enr.thumbnail || enr.thumbnailUrl || course?.thumbnail || course?.thumbnailUrl;
      const resolvedTitle = enr.courseTitle || course?.title || 'Academic Course Track';
      const resolvedInstitution = enr.institution || course?.institution || course?.organizationName || 'Stanford University';
      const resolvedProgress = typeof enr.progress === 'number' ? enr.progress : (enr.status === 'Completed' ? 100 : 0);
      return {
        ...enr,
        courseTitle: resolvedTitle,
        thumbnail: resolvedThumbnail,
        thumbnailUrl: resolvedThumbnail,
        institution: resolvedInstitution,
        progress: resolvedProgress,
      };
    });
    return enriched;
  }

  async enrollCourse(userId: string, courseId: string, extra?: { thumbnail?: string; institution?: string; courseTitle?: string }) {
    const learner = await this.getProfile(userId);
    let course = await this.coursesRepo.findById(courseId);
    if (!course) {
      const allCourses = await this.coursesRepo.find();
      course = allCourses.find((c) => c.id === courseId || c.title?.toLowerCase() === extra?.courseTitle?.toLowerCase());
    }

    const resolvedThumbnail = extra?.thumbnail || course?.thumbnail || course?.thumbnailUrl;
    const resolvedInstitution = extra?.institution || course?.institution || course?.organizationName || 'Stanford University';
    const resolvedTitle = extra?.courseTitle || course?.title || 'Masterclass Track';

    const existing = await this.enrollmentsRepo.findOne({
      learnerId: learner.id,
      courseId: courseId,
    });

    if (existing) {
      // Ensure existing record has latest course thumbnail, institution, and resets to 0 if newly purchased
      await this.enrollmentsRepo.update(existing.id, {
        thumbnail: resolvedThumbnail || existing.thumbnail,
        thumbnailUrl: resolvedThumbnail || existing.thumbnailUrl,
        institution: resolvedInstitution || existing.institution,
        courseTitle: resolvedTitle || existing.courseTitle,
        progress: 0,
        status: 'Active',
      });
      return {
        ...existing,
        thumbnail: resolvedThumbnail || existing.thumbnail,
        thumbnailUrl: resolvedThumbnail || existing.thumbnailUrl,
        institution: resolvedInstitution || existing.institution,
        courseTitle: resolvedTitle || existing.courseTitle,
        progress: 0,
        status: 'Active',
      };
    }

    const newEnrollment = await this.enrollmentsRepo.create({
      id: `enr-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      learnerEmail: learner.email,
      learnerAvatar: learner.avatar,
      courseId: course?.id || courseId,
      courseTitle: resolvedTitle,
      thumbnail: resolvedThumbnail,
      thumbnailUrl: resolvedThumbnail,
      institution: resolvedInstitution,
      enrolledDate: new Date().toISOString().split('T')[0],
      enrolledAt: new Date().toISOString(),
      progress: 0,
      status: 'Active',
      completedLessons: [],
      lastAccessedLesson: null,
    });

    if (course) {
      await this.coursesRepo.update(course.id, {
        enrolledCount: (course.enrolledCount || 0) + 1,
      });
    }

    return newEnrollment;
  }

  async updateProgress(userId: string, enrollmentId: string, lessonId: string, completed: boolean) {
    const enrollment = await this.enrollmentsRepo.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment '${enrollmentId}' not found`);
    }

    const completedLessons = new Set<string>(enrollment.completedLessons || []);
    if (completed) {
      completedLessons.add(lessonId);
    } else {
      completedLessons.delete(lessonId);
    }

    const course = await this.coursesRepo.findById(enrollment.courseId);
    const totalLessons = course?.lessonsCount || 10;
    const progress = Math.min(100, Math.round((completedLessons.size / totalLessons) * 100));
    const status = progress >= 100 ? 'Completed' : 'Active';

    const updated = await this.enrollmentsRepo.update(enrollmentId, {
      completedLessons: Array.from(completedLessons),
      progress,
      status,
    });

    return updated;
  }

  async getCertificates(userId: string) {
    const learner = await this.getProfile(userId);
    const certificates = await this.certificatesRepo.find({
      where: { learnerId: learner.id },
    });
    return certificates;
  }

  async getPayments(userId: string) {
    const learner = await this.getProfile(userId);
    const transactions = await this.transactionsRepo.find({
      where: { payerId: learner.id },
    });
    return transactions;
  }

  async checkout(userId: string, dto: StudentCheckoutDto) {
    const learner = await this.getProfile(userId);
    const course = await this.coursesRepo.findById(dto.courseId);

    const now = new Date().toISOString();
    const transaction = await this.transactionsRepo.create({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Payment',
      payerId: learner.id,
      payer: learner.name,
      course: course?.title || 'Masterclass Track',
      amount: dto.amount || course?.price || 4999,
      method: dto.paymentMethod || 'Credit Card',
      date: now,
      status: 'Completed',
      createdAt: now,
      updatedAt: now,
    });

    await this.enrollCourse(userId, dto.courseId, {
      thumbnail: dto.thumbnail,
      institution: dto.institution,
      courseTitle: dto.courseTitle,
    });

    return {
      success: true,
      transactionId: transaction.id,
      courseTitle: dto.courseTitle || course?.title || 'Masterclass Track',
      amount: transaction.amount,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  }
}
