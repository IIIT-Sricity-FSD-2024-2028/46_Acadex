import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.REVIEWS)
    private readonly reviewsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>,
  ) {}

  private async learnerIdFor(userId?: string) {
    if (!userId) return '';
    const learners = await this.learnersRepo.find();
    const learner = learners.find((l) => l.id === userId || l.userId === userId);
    return learner?.id || userId;
  }

  async findAll(instructorId?: string) {
    if (!instructorId) {
      return this.reviewsRepo.find();
    }
    const allCourses = await this.coursesRepo.find();
    const instructorCourseIds = allCourses
      .filter((c) => {
        const isDirect = c.instructorId === instructorId;
        const isInTeam = (c.instructors || []).some((inst: any) => inst.id === instructorId);
        return isDirect || isInTeam;
      })
      .map((c) => c.id);

    const allReviews = await this.reviewsRepo.find();
    return allReviews.filter((r) => instructorCourseIds.includes(r.courseId));
  }

  async findByCourse(courseId: string) {
    return this.reviewsRepo.find({ where: { courseId } });
  }

  async create(data: any, userId?: string) {
    const courseId = data?.courseId || '';
    const learnerId = await this.learnerIdFor(userId);

    if (!courseId) throw new BadRequestException('courseId is required');
    if (!learnerId) throw new BadRequestException('x-user-id header is required');

    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException(`Course '${courseId}' not found`);

    const enrollment = await this.enrollmentsRepo.findOne({ learnerId, courseId });
    if (!enrollment) throw new ForbiddenException('Only enrolled learners can review this course');

    // Prevent duplicate reviews from same learner for same course
    const existing = await this.reviewsRepo.find({ where: { courseId, learnerId } });
    if (existing.length > 0) {
      throw new ConflictException('You have already reviewed this course. Edit your existing review.');
    }

    const rating = Math.min(5, Math.max(1, Math.round(Number(data?.rating) || 5)));
    const comment = (data?.comment || data?.content || data?.review || '').trim();

    const review = await this.reviewsRepo.create({
      learnerId,
      learnerName: data?.learnerName || 'Learner',
      learnerAvatar: data?.learnerAvatar || data?.avatar || '',
      courseId,
      courseTitle: course?.title || '',
      rating,
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.updateCourseRating(courseId);

    // Automatically notify the course instructor
    if (course?.instructorId) {
      const snippet = comment.length > 70 ? `${comment.slice(0, 70)}...` : comment;
      await this.notifsRepo.create({
        id: `notif-${Date.now()}`,
        title: `New ${rating}★ Rating on ${course.title || 'Course'}`,
        desc: `${review.learnerName} rated this track ${rating}★: "${snippet}"`,
        category: 'Review',
        recipientId: course.instructorId,
        recipientRole: 'instructor',
        courseId,
        actionUrl: '/instructor/reviews',
        read: false,
        color: 'amber',
        createdAt: new Date().toISOString(),
      });
    }

    return review;
  }

  async update(id: string, data: any, userId?: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) throw new NotFoundException(`Review '${id}' not found`);

    if (review.learnerId !== (await this.learnerIdFor(userId))) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    const updates: any = { updatedAt: new Date().toISOString() };
    if (data.rating != null) updates.rating = Math.min(5, Math.max(1, Math.round(Number(data.rating))));
    if (data.comment != null) updates.comment = data.comment;

    const updated = await this.reviewsRepo.update(id, updates);
    await this.updateCourseRating(review.courseId);
    return updated;
  }

  async delete(id: string, userId?: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) throw new NotFoundException(`Review '${id}' not found`);

    if (review.learnerId !== (await this.learnerIdFor(userId))) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewsRepo.delete(id);
    await this.updateCourseRating(review.courseId);
    return { success: true, message: 'Review deleted' };
  }

  async reply(id: string, responseText: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) throw new NotFoundException(`Review '${id}' not found`);
    return this.reviewsRepo.update(id, { response: responseText, repliedAt: new Date().toISOString() });
  }

  async deleteReply(id: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) throw new NotFoundException(`Review '${id}' not found`);
    return this.reviewsRepo.update(id, { response: null, repliedAt: null });
  }

  private async updateCourseRating(courseId: string) {
    try {
      const reviews = await this.reviewsRepo.find({ where: { courseId } });
      if (reviews.length === 0) {
        await this.coursesRepo.update(courseId, { rating: null, reviewsCount: 0 });
        return;
      }
      const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
      await this.coursesRepo.update(courseId, {
        rating: Math.round(avg * 10) / 10,
        reviewsCount: reviews.length,
      });
    } catch {
      // Non-fatal — rating update failure shouldn't break review creation
    }
  }
}
