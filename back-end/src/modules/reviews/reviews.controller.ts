import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews & Course Ratings')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews across courses (optionally filtered by instructorId)' })
  findAll(@Query('instructorId') instructorId?: string) {
    return this.reviewsService.findAll(instructorId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.reviewsService.findByCourse(courseId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a student review and rating for a course' })
  create(@Body() body: any, @Headers('x-user-id') userId: string) {
    return this.reviewsService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing review (owner only)' })
  update(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('x-user-id') userId: string,
  ) {
    return this.reviewsService.update(id, body, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review (owner only)' })
  delete(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.reviewsService.delete(id, userId);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Instructor reply to a student review' })
  reply(@Param('id') id: string, @Body() body: { response: string }) {
    return this.reviewsService.reply(id, body.response);
  }

  @Delete(':id/reply')
  @ApiOperation({ summary: 'Delete instructor reply to a student review' })
  deleteReply(@Param('id') id: string) {
    return this.reviewsService.deleteReply(id);
  }
}
