import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Learners')
@ApiSecurity('x-role')
@Roles('admin', 'learner', 'instructor')
@Controller('learners')
export class LearnersController {
  constructor(private readonly learnersService: LearnersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all learners' })
  findAll() {
    return this.learnersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get learner by ID' })
  findOne(@Param('id') id: string) {
    return this.learnersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new learner' })
  create(@Body() body: any) {
    return this.learnersService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update learner' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.learnersService.update(+id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete learner' })
  remove(@Param('id') id: string) {
    return this.learnersService.remove(+id);
  }
}
