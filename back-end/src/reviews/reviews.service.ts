import { Injectable, NotFoundException } from '@nestjs/common';
import { reviews } from '../data';

@Injectable()
export class ReviewsService {
  findAll(query?: { courseId?: string; rating?: number; search?: string }) {
    let result = [...reviews];
    if (query?.courseId && query.courseId !== 'All Courses') {
      result = result.filter(r => r.courseId === query.courseId || r.course === query.courseId);
    }
    if (query?.rating) {
      result = result.filter(r => r.rating === Number(query.rating));
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        r.course.toLowerCase().includes(q)
      );
    }

    const ratingBreakdown = [
      { stars: 5, count: 850, percent: 68 },
      { stars: 4, count: 250, percent: 20 },
      { stars: 3, count: 100, percent: 8 },
      { stars: 2, count: 30, percent: 3 },
      { stars: 1, count: 15, percent: 1 },
    ];

    return {
      reviews: result,
      averageRating: 4.8,
      totalReviews: 1245,
      ratingBreakdown,
    };
  }

  reply(id: number, responseText: string) {
    const review = reviews.find(r => r.id === Number(id));
    if (!review) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    review.response = responseText;
    return review;
  }

  deleteReply(id: number) {
    const review = reviews.find(r => r.id === Number(id));
    if (!review) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    review.response = null;
    return review;
  }
}
