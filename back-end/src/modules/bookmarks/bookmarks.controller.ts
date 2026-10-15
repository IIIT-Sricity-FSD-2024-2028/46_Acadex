import { Controller, Get, Post, Delete, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';

@ApiTags('Bookmarks')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks for the authenticated learner' })
  findAll(@Headers('x-user-id') userId: string) {
    const learnerId = userId || '';
    return this.bookmarksService.findByLearner(learnerId);
  }

  @Post(':courseId/toggle')
  @ApiOperation({ summary: 'Toggle bookmark for a course (add if not bookmarked, remove if bookmarked)' })
  toggle(
    @Param('courseId') courseId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const learnerId = userId || '';
    return this.bookmarksService.toggle(learnerId, courseId);
  }

  @Get(':courseId/status')
  @ApiOperation({ summary: 'Check if a course is bookmarked by the current learner' })
  status(
    @Param('courseId') courseId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const learnerId = userId || '';
    return this.bookmarksService.isBookmarked(learnerId, courseId);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Remove a bookmark for a course' })
  remove(
    @Param('courseId') courseId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const learnerId = userId || '';
    return this.bookmarksService.remove(learnerId, courseId);
  }
}
