import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class BookmarksService {
  constructor(
    @Inject(REPOSITORY_TOKENS.BOOKMARKS)
    private readonly bookmarksRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
  ) {}

  async findByLearner(learnerId: string) {
    const bookmarks = await this.bookmarksRepo.find({ where: { learnerId } });
    // Enrich with course data
    const enriched = await Promise.all(
      bookmarks.map(async (bm) => {
        const course = await this.coursesRepo.findById(bm.courseId).catch(() => null);
        return { ...bm, course: course || null };
      }),
    );
    return enriched;
  }

  async toggle(learnerId: string, courseId: string) {
    const existing = await this.bookmarksRepo.find({
      where: { learnerId, courseId },
    });

    if (existing.length > 0) {
      await this.bookmarksRepo.delete(existing[0].id);
      return { bookmarked: false, message: 'Bookmark removed' };
    }

    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course '${courseId}' not found`);
    }

    await this.bookmarksRepo.create({
      learnerId,
      courseId,
      courseTitle: course.title,
      createdAt: new Date().toISOString(),
    });

    return { bookmarked: true, message: 'Course bookmarked' };
  }

  async isBookmarked(learnerId: string, courseId: string) {
    const existing = await this.bookmarksRepo.find({
      where: { learnerId, courseId },
    });
    return { bookmarked: existing.length > 0 };
  }

  async remove(learnerId: string, courseId: string) {
    const existing = await this.bookmarksRepo.find({
      where: { learnerId, courseId },
    });
    if (existing.length === 0) {
      throw new NotFoundException(`Bookmark not found`);
    }
    await this.bookmarksRepo.delete(existing[0].id);
    return { bookmarked: false, message: 'Bookmark removed' };
  }
}
