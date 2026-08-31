import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Refunds')
@ApiSecurity('x-role')
@Roles('admin')
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all refund requests' })
  findAll() {
    return this.refundsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund request by ID' })
  findOne(@Param('id') id: string) {
    return this.refundsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Approve or reject a refund' })
  update(@Param('id') id: string, @Body() body: { status: string; reason?: string }) {
    return this.refundsService.update(id, body);
  }
}
