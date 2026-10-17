import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from '../organization/organization.service';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics & Telemetry')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService, private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get institutional analytics overview' })
  async getRootOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get institutional analytics overview, category breakdown, retention' })
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('super-admin')
  @ApiOperation({ summary: 'Get Super Admin platform governance telemetry' })
  async getSuperAdmin() {
    return this.analyticsService.getSuperAdminAnalytics();
  }

  @Get('instructor')
  @ApiOperation({ summary: 'Get Instructor telemetry and course metrics' })
  async getInstructor(@Query('instructorId') instructorId?: string) {
    return this.analyticsService.getInstructorAnalytics(instructorId);
  }

  @Get('organization')
  @ApiOperation({ summary: 'Get Organization analytics overview' })
  async getOrganization(@Headers('x-user-id') userId?: string, @Headers('x-user-email') email?: string) {
    const org = await this.organizationService.getProfile(userId, email);
    return this.analyticsService.getOverview(org.id);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue projection and payout liability telemetry' })
  async getRevenue() {
    return this.analyticsService.getRevenueAnalytics();
  }
}
