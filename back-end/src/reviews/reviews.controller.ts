import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Reviews')
@ApiSecurity('x-role')
@Roles('admin', 'instructor')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews with stats' })
  findAll(
    @Query('courseId') courseId?: string,
    @Query('rating') rating?: number,
    @Query('search') search?: string,
  ) {
    return this.reviewsService.findAll({ courseId, rating, search });
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to a student review' })
  reply(@Param('id') id: string, @Body() body: { response: string }) {
    return this.reviewsService.reply(Number(id), body.response);
  }

  @Delete(':id/reply')
  @ApiOperation({ summary: 'Delete reply to a student review' })
  deleteReply(@Param('id') id: string) {
    return this.reviewsService.deleteReply(Number(id));
  }
}
