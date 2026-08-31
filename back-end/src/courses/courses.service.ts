import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { courses } from '../data';

@Injectable()
export class CoursesService {
  create(createCourseDto: CreateCourseDto): any {
    const newCourse: any = {
      id: Date.now().toString(),
      title: createCourseDto.title || 'Untitled Course',
      subtitle: createCourseDto.subtitle || '',
      description: createCourseDto.description || '',
      instructor: createCourseDto.instructor || 'Dr. Sarah Jenkins',
      organization: createCourseDto.organization || 'University of Tech',
      category: createCourseDto.category || 'Computer Science',
      level: createCourseDto.level || 'Intermediate',
      price: createCourseDto.price ?? 49.99,
      students: createCourseDto.students ?? 0,
      rating: createCourseDto.rating ?? 0,
      status: createCourseDto.status || 'Draft',
      visibility: createCourseDto.visibility ?? true,
      certificate: createCourseDto.certificate ?? true,
      updated: 'Just now',
      timestamp: Date.now(),
      createdDate: createCourseDto.createdDate || new Date().toISOString().split('T')[0],
      image: createCourseDto.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
      objectives: Array.isArray(createCourseDto.objectives)
        ? createCourseDto.objectives
        : createCourseDto.objectives
        ? [createCourseDto.objectives]
        : [],
      prerequisites: createCourseDto.prerequisites || '',
      modules: createCourseDto.modules || [],
    };
    (courses as any[]).push(newCourse);
    return newCourse;
  }

  findAll(): any[] {
    return courses;
  }

  findOne(id: string): any {
    const course = courses.find((c: any) => String(c.id) === String(id));
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  update(id: string, updateCourseDto: UpdateCourseDto): any {
    const index = courses.findIndex((c: any) => String(c.id) === String(id));
    if (index === -1) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    (courses as any[])[index] = { ...(courses as any[])[index], ...updateCourseDto, updated: 'Just now' };
    return courses[index];
  }

  remove(id: string): void {
    const index = courses.findIndex((c: any) => String(c.id) === String(id));
    if (index === -1) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    courses.splice(index, 1);
  }
}
