import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Enrollments')
@ApiSecurity('x-role')
@Roles('admin', 'learner', 'instructor')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all enrollments' })
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new enrollment' })
  create(@Body() body: any) {
    return this.enrollmentsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update enrollment progress' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.enrollmentsService.update(+id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel enrollment' })
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(+id);
  }
}
