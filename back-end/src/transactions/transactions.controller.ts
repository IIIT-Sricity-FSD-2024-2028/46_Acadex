import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Transactions')
@ApiSecurity('x-role')
@Roles('admin', 'organization', 'learner')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Record transaction' })
  create(@Body() body: any) {
    return this.transactionsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.transactionsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
