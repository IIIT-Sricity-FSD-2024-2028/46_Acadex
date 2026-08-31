import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Quizzes')
@ApiSecurity('x-role')
@Roles('admin', 'instructor', 'learner')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quizzes' })
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new quiz' })
  create(@Body() body: any) {
    return this.quizzesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quiz' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.quizzesService.update(id, body);
  }
}
