import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Instructors')
@ApiSecurity('x-role')
@Roles('admin', 'instructor')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new instructor' })
  create(@Body() createInstructorDto: CreateInstructorDto) {
    return this.instructorsService.create(createInstructorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all instructors' })
  findAll() {
    return this.instructorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an instructor by id' })
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Update an instructor' })
  update(@Param('id') id: string, @Body() updateInstructorDto: UpdateInstructorDto) {
    return this.instructorsService.update(id, updateInstructorDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an instructor' })
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(id);
  }
}
