import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import {
  CreateDisputeDto,
  DisputeQueryDto,
  ResolveDisputeDto,
  UpdateDisputeStatusDto,
} from './dto/dispute.dto';

@ApiTags('Disputes & Governance')
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  @ApiOperation({ summary: 'List all organization disputes with status, priority filters and search' })
  async findAll(@Query() query: DisputeQueryDto) {
    return this.disputesService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all disputes raised by current learner' })
  @ApiResponse({ status: 200, description: 'Returns learner dispute tickets' })
  async findMy(@Headers('x-user-id') userId: string) {
    return this.disputesService.findMy(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute ticket details and history' })
  @ApiResponse({ status: 200, description: 'Returns dispute details' })
  async findOne(@Param('id') id: string) {
    return this.disputesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Raise a new dispute ticket (Royalty, Content Quality, Plagiarism, IP)' })
  @ApiResponse({ status: 201, description: 'Dispute ticket logged successfully' })
  async create(@Body() dto: CreateDisputeDto) {
    return this.disputesService.create(dto);
  }

  @Patch(':id/priority')
  updatePriority(@Param('id') id: string, @Body() body: { priority: string }) {
    return this.disputesService.updatePriority(id, body.priority);
  }

  @Patch(':id/status')
  @Post(':id/status')
  @ApiOperation({ summary: 'Update dispute workflow status (Open, Under Review, Escalated, Resolved)' })
  @ApiResponse({ status: 200, description: 'Dispute status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDisputeStatusDto) {
    return this.disputesService.updateStatus(id, dto);
  }

  @Patch(':id/resolve')
  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve a dispute ticket with formal resolution rationale' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolve(@Param('id') id: string, @Body() dto: any) {
    return this.disputesService.resolve(id, dto);
  }

  @Patch(':id/reject')
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a dispute ticket with formal reason' })
  @ApiResponse({ status: 200, description: 'Dispute rejected successfully' })
  async reject(@Param('id') id: string, @Body() dto: any) {
    return this.disputesService.reject(id, dto);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment / internal note to dispute' })
  @ApiResponse({ status: 201, description: 'Comment added' })
  async addComment(@Param('id') id: string, @Body() dto: any) {
    return this.disputesService.addComment(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dispute ticket' })
  @ApiResponse({ status: 200, description: 'Dispute deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.disputesService.delete(id);
  }
}
