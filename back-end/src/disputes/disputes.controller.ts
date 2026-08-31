import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Disputes')
@ApiSecurity('x-role')
@Roles('admin', 'learner', 'organization')
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all disputes' })
  findAll() {
    return this.disputesService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dispute aggregate statistics' })
  getStats() {
    return this.disputesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  findOne(@Param('id') id: string) {
    return this.disputesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Raise a dispute' })
  create(@Body() body: any) {
    return this.disputesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dispute fields' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.disputesService.update(id, body);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve a dispute' })
  resolve(
    @Param('id') id: string,
    @Body() body: { resolutionNote: string; resolvedBy?: string },
  ) {
    return this.disputesService.resolve(id, body);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a dispute' })
  reject(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string; resolvedBy?: string },
  ) {
    return this.disputesService.reject(id, body);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment or admin note to a dispute' })
  addComment(
    @Param('id') id: string,
    @Body() body: { author: string; message: string; isAdmin?: boolean },
  ) {
    return this.disputesService.addComment(id, body);
  }

  @Patch(':id/priority')
  @ApiOperation({ summary: 'Update the priority of a dispute' })
  updatePriority(
    @Param('id') id: string,
    @Body() body: { priority: string },
  ) {
    return this.disputesService.updatePriority(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove dispute' })
  remove(@Param('id') id: string) {
    return this.disputesService.remove(id);
  }
}
