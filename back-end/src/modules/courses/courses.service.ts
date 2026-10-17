import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>
  ) {}

  async findAll(query: CourseQueryDto) {
    const { page = 1, limit = 10, search, category, level, status, instructorId, organizationId, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (level && level !== 'All') {
      where.level = level;
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (instructorId) {
      where.$or = [
        { instructorId: instructorId },
        { 'instructors.id': instructorId },
      ];
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (search) {
      where.$or = [
        { title: { $contains: search } },
        { category: { $contains: search } },
        { instructorName: { $contains: search } },
        { description: { $contains: search } },
      ];
    }

    return this.coursesRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const course = await this.coursesRepo.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    // Populate recent enrollments for this course
    const enrollments = await this.enrollmentsRepo.find({
      where: { courseId: id },
      limit: 10,
    });

    return {
      ...course,
      recentEnrollments: enrollments,
    };
  }

  async create(dto: CreateCourseDto, organizationId?:string) {
    const instructorsList = await this.resolveInstructors(dto);
    const leadInstructor = instructorsList[0];
    if (!leadInstructor) throw new BadRequestException('Assign an existing instructor to the course.');
    if(organizationId&&instructorsList.some(i=>!i.id))throw new BadRequestException('Choose instructors from your organization.');
    if(organizationId){const teachers=await this.instructorsRepo.find();if(instructorsList.some(i=>!teachers.some(t=>t.id===i.id&&t.organizationId===organizationId)))throw new BadRequestException('All instructors must belong to your organization.');}
    const modules = Array.isArray(dto.modules) ? dto.modules : [];
    const lessonsCount = modules.reduce((sum, m: any) => sum + (Array.isArray(m.items)?m.items.length:Array.isArray(m.lessons)?m.lessons.length:Number(m.lessons)||0), 0);

    const newCourse = await this.coursesRepo.create({
      title: dto.title,
      category: dto.category || '',
      level: dto.level || 'Beginner',
      instructorId: leadInstructor.id,
      instructorName: instructorsList.map((i) => i.name).join(', '),
      leadInstructorName: leadInstructor.name,
      organizationId: (await this.instructorsRepo.findById(leadInstructor.id))?.organizationId,
      instructors: instructorsList,
      enrolledCount: 0,
      price: typeof dto.price === 'number' ? dto.price : 0,
      currency: 'INR',
      revenue: 0,
      rating: null,
      completionRate: null,
      totalHours: null,
      lessonsCount,
      modulesCount: modules.length,
      status: dto.status || 'Draft',
      thumbnail: dto.thumbnail || null,
      description: dto.description || '',
      modules,
    });

    return newCourse;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const existing = await this.coursesRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    let updatedInstructors = dto.instructors || existing.instructors || [];

    if (dto.instructorId || dto.coInstructorIds) {
      updatedInstructors = await this.resolveInstructors(dto);
    }

    const leadInst = updatedInstructors[0] || { id: existing.instructorId, name: existing.leadInstructorName };

    const modules = dto.modules || existing.modules || [];
    const lessonsCount = modules.reduce((sum: number, m: any) => sum + (Array.isArray(m.items)?m.items.length:Array.isArray(m.lessons)?m.lessons.length:Number(m.lessons)||0), 0);

    return this.coursesRepo.update(id, {
      ...dto,
      instructors: updatedInstructors,
      instructorId: leadInst.id,
      leadInstructorName: leadInst.name,
      instructorName: updatedInstructors.map((i: any) => i.name).join(', '),
      modules,
      modulesCount: modules.length,
      lessonsCount,
      price: typeof dto.price === 'number' ? dto.price : existing.price,
    });
  }

  async delete(id: string) {
    const existing = await this.coursesRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }
    return this.coursesRepo.update(id, { status: 'Archived' });
  }

  private async resolveInstructors(dto: { instructorId?: string; coInstructorIds?: string[]; instructors?: any[] }) {
    if (dto.instructors && Array.isArray(dto.instructors) && dto.instructors.length > 0) {
      return dto.instructors;
    }

    const allInstructors = await this.instructorsRepo.find();
    const lead = allInstructors.find((i) => i.id === dto.instructorId);
    if (!lead) throw new BadRequestException('Choose an existing lead instructor.');

    const result = [
      {
        id: lead.id,
        name: lead.name,
        role: 'Lead Instructor',
        avatar: lead.avatar,
        specialization: lead.specialization,
      },
    ];

    if (Array.isArray(dto.coInstructorIds)) {
      dto.coInstructorIds.forEach((coId) => {
        if (coId !== lead.id) {
          const co = allInstructors.find((i) => i.id === coId);
          if (co) {
            result.push({
              id: co.id,
              name: co.name,
              role: 'Co-Instructor',
              avatar: co.avatar,
              specialization: co.specialization,
            });
          }
        }
      });
    }

    return result;
  }
}
