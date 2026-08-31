import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { instructors } from '../data';

@Injectable()
export class InstructorsService {
  create(createInstructorDto: CreateInstructorDto): any {
    const newInstructor: any = {
      id: Date.now().toString(),
      ...createInstructorDto,
      role: 'instructor',
    };
    (instructors as any[]).push(newInstructor);
    return newInstructor;
  }

  findAll(): any[] {
    return instructors;
  }

  findOne(id: string): any {
    const instructor = instructors.find((i: any) => String(i.id) === String(id) || String(i.userId) === String(id));
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
    return instructor;
  }

  update(id: string, updateInstructorDto: UpdateInstructorDto): any {
    const index = instructors.findIndex((i: any) => String(i.id) === String(id) || String(i.userId) === String(id));
    if (index === -1) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
    (instructors as any[])[index] = { ...(instructors as any[])[index], ...updateInstructorDto };
    return instructors[index];
  }

  remove(id: string): void {
    const index = instructors.findIndex((i: any) => String(i.id) === String(id) || String(i.userId) === String(id));
    if (index === -1) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
    instructors.splice(index, 1);
  }
}
