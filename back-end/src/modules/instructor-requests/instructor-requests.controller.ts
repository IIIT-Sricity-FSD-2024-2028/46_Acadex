import {ForbiddenException,BadRequestException} from '@nestjs/common';
import {WorkspaceService} from '../platform/workspace.service';
import {CourseWorkflowService} from '../courses/course-workflow.service';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InstructorRequestsService } from './instructor-requests.service';
import {
  CreateJoinRequestDto,
  CreateTeachingRequestDto,
  DecideJoinRequestDto,
  InstructorRequestQueryDto,
  RespondTeachingRequestDto,
  WithdrawTeachingRequestDto,
} from './dto/instructor-request.dto';

@ApiTags('Instructor Requests')
@Controller('instructor-requests')
export class InstructorRequestsController {
  constructor(private readonly requestsService: InstructorRequestsService,private readonly workspace:WorkspaceService,private readonly workflow:CourseWorkflowService) {}

  @Get()
  @ApiOperation({ summary: 'List requests (filter by organizationId, instructorId, type)' })
  findAll(@Query() query: InstructorRequestQueryDto) {
    return this.requestsService.findAll(query);
  }

  // Join requests: instructor asks, organization decides. Static routes come before ':id'.
  @Get('join/mine')
  @ApiOperation({ summary: 'Join requests sent by the current instructor' })
  myJoinRequests(@Headers('x-user-id') userId: string) {
    return this.requestsService.myJoinRequests(userId);
  }

  @Post('join')
  @ApiOperation({ summary: 'Instructor requests to join an organization (needs organization approval)' })
  createJoinRequest(@Headers('x-user-id') userId: string, @Body() dto: CreateJoinRequestDto) {
    return this.requestsService.createJoinRequest(userId, dto);
  }

  @Get('join/incoming')
  @ApiOperation({ summary: 'Join requests sent to the current organization' })
  orgJoinRequests(@Headers('x-user-email') userEmail: string) {
    return this.requestsService.orgJoinRequests(userEmail);
  }

  @Patch('join/:id/cancel')
  @ApiOperation({ summary: 'Instructor cancels a pending join request' })
  cancelJoinRequest(@Headers('x-user-id') userId: string, @Param('id') id: string) {
    return this.requestsService.cancelJoinRequest(userId, id);
  }

  @Patch('join/:id/decide')
  @ApiOperation({ summary: 'Organization approves or rejects a join request' })
  decideJoinRequest(
    @Headers('x-user-email') userEmail: string,
    @Param('id') id: string,
    @Body() dto: DecideJoinRequestDto,
  ) {
    return this.requestsService.decideJoinRequest(userEmail, id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single request' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Organization sends a teaching invitation to an instructor' })
  async create(@Body() dto: CreateTeachingRequestDto,@Headers('x-user-id') userId:string) {
    const actor=await this.workspace.identity({'x-user-id':userId});
    if(actor.canonicalRole!=='organization')throw new ForbiddenException('Organization access is required.');
    if(dto.courseId||dto.courseTitle&&dto.courseTitle!=='General Course Assignment'){const options=await this.workflow.assignmentOptions(actor);const courseId=dto.courseId||options.courses.find(c=>c.title===dto.courseTitle)?.id;if(!courseId)throw new BadRequestException('Choose an existing course to assign.');return this.workflow.assign({courseIds:[courseId],instructorIds:[dto.instructorId]},actor);}
    dto.organizationId=actor.profileId;
    return this.requestsService.create(dto);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Instructor accepts or declines a teaching invitation' })
  respond(@Param('id') id: string, @Body() dto: RespondTeachingRequestDto) {
    return this.requestsService.respond(id, dto);
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Organization withdraws a pending invitation' })
  withdraw(@Param('id') id: string, @Body() dto: WithdrawTeachingRequestDto) {
    return this.requestsService.withdraw(id, dto);
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Send a reminder for a pending invitation' })
  resend(@Param('id') id: string) {
    return this.requestsService.resend(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a request record' })
  delete(@Param('id') id: string) {
    return this.requestsService.delete(id);
  }
}
