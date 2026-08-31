import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Analytics')
@ApiSecurity('x-role')
@Roles('admin', 'instructor')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get overview analytics for admin' })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('instructor')
  @ApiOperation({ summary: 'Get analytics for instructor dashboard and insights' })
  getInstructorAnalytics() {
    return this.analyticsService.getInstructorAnalytics();
  }
}
