import { ConflictException, Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.REVIEWS)
    private readonly reviewsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
  ) {}

  async findAll() {
    return this.reviewsRepo.find();
  }

  async findByCourse(courseId: string) {
    return this.reviewsRepo.find({ where: { courseId } });
  }

  async create(data: any, userId?: string) {
    const courseId = data?.courseId || '';
    const learnerId = userId || data?.learnerId || '';

    if (!courseId) throw new NotFoundException('courseId is required');
    if (!learnerId) throw new NotFoundException('learnerId (x-user-id header) is required');

    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException(`Course '${courseId}' not found`);

    // Prevent duplicate reviews from same learner for same course
    const existing = await this.reviewsRepo.find({ where: { courseId, learnerId } });
    if (existing.length > 0) {
      throw new ConflictException('You have already reviewed this course. Edit your existing review.');
    }

    const rating = Math.min(5, Math.max(1, Math.round(Number(data?.rating) || 5)));
    const comment = (data?.comment || data?.content || data?.review || '').trim();

    const review = await this.reviewsRepo.create({
      learnerId,
      learnerName: data?.learnerName || data?.userName || 'Student',
      learnerAvatar: data?.learnerAvatar || data?.avatar || '',
      courseId,
      courseTitle: course?.title || '',
      rating,
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.updateCourseRating(courseId);
    return review;
  }

  async update(id: string, data: any, userId?: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) throw new NotFoundException(`Review '${id}' not found`);

    if (userId && review.learnerId !== userId) {
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

    if (userId && review.learnerId !== userId) {
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
