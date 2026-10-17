import {JsonDatabaseService} from '../../database/json-db.service';
import {assignedInstructorIds} from '../../common/courses/assignment';
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CreateInstructorDto, InstructorQueryDto, UpdateInstructorDto } from './dto/instructor.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class InstructorsService {
  constructor(
    private readonly db:JsonDatabaseService,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATIONS)
    private readonly orgsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepo: JsonRepository<any>,
  ) {}

  async findAll(query: InstructorQueryDto) {
    const { page = 1, limit = 10, search, specialization, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (specialization) {
      where.specialization = { $contains: specialization };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.$or = [
        { name: { $contains: search } },
        { email: { $contains: search } },
        { specialization: { $contains: search } },
      ];
    }

    const result=await this.instructorsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
    return {...result,items:await Promise.all(result.items.map(i=>this.enrich(i)))};
  }

  private async enrich(instructor:any){const [courses,enrollments,reviews,transactions]=await Promise.all(['courses','enrollments','reviews','transactions'].map(n=>this.db.getCollection<any>(n)));const taught=courses.filter(c=>c.organizationId===instructor.organizationId&&assignedInstructorIds(c).includes(instructor.id));const current=taught.filter(c=>c.status!=='Archived');const ids=new Set(current.map(c=>c.id));const historicalIds=new Set(taught.map(c=>c.id));const rows=enrollments.filter(e=>ids.has(e.courseId));const ratings=reviews.filter(r=>ids.has(r.courseId)&&Number(r.rating)>=1&&Number(r.rating)<=5);const paid=transactions.filter(t=>historicalIds.has(t.courseId)&&t.type==='Payment'&&['completed','paid','success','successful'].includes(String(t.status).toLowerCase()));return {...instructor,courses:current,coursesCount:current.length,enrolledStudents:new Set(rows.map(e=>e.learnerId)).size,avgRating:ratings.length?Math.round(ratings.reduce((s,r)=>s+Number(r.rating),0)/ratings.length*10)/10:null,revenueGenerated:paid.reduce((sum,p)=>sum+Number(p.amount||0),0)};}
  async findOne(id: string) {
    const instructor = await this.instructorsRepo.findById(id);
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID '${id}' not found`);
    }

    return this.enrich(instructor);
  }

  async create(dto: CreateInstructorDto) {
    const newInstructor = await this.instructorsRepo.create({
      ...dto,
      coursesCount: 0,
      enrolledStudents: 0,
      avgRating: null,
      revenueGenerated: 0,
      status: dto.status || 'Active',
      avatar: null,
      joinedDate: dto.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
    return newInstructor;
  }

  async update(id: string, dto: UpdateInstructorDto) {
    const existing = await this.instructorsRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Instructor with ID '${id}' not found`);
    }
    return this.instructorsRepo.update(id, dto);
  }

  async delete(id: string) {
    const existing = await this.instructorsRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Instructor with ID '${id}' not found`);
    }
    return this.instructorsRepo.delete(id);
  }

  async getInstructorCourses(id: string) {
    await this.findOne(id);
    return this.coursesRepo.find({
      where: {
        $or: [
          { instructorId: id },
          { 'instructors.id': id },
        ],
      },
    });
  }

  async leaveOrganization(id: string, userId?: string) {
    const instructor = await this.instructorsRepo.findById(id);
    if (!instructor) throw new NotFoundException(`Instructor with ID '${id}' not found`);
    if (!userId || (instructor.userId !== userId && instructor.id !== userId)) {
      throw new ForbiddenException('You can only change your own affiliation');
    }
    if (!instructor.organizationId) throw new BadRequestException('You are not part of an organization');

    const courses = (await this.coursesRepo.find()).filter(
      (c) => c.instructorId === id || (c.instructors || []).some((m: any) => m.id === id)
    );
    const soleCourses = courses.filter((c) => (c.instructors || []).filter((m: any) => m.id !== id).length === 0);
    if (soleCourses.length) {
      throw new BadRequestException(
        `You are the only instructor of: ${soleCourses.map((c) => c.title).join(', ')}. Ask your organization to reassign these courses first.`
      );
    }

    for (const course of courses) {
      const team = (course.instructors || []).filter((m: any) => m.id !== id);
      const lead = team[0];
      await this.coursesRepo.update(course.id, {
        instructors: team,
        ...(course.instructorId === id
          ? { instructorId: lead.id, instructorName: lead.name, leadInstructorName: lead.name }
          : {}),
      });
    }

    const org = await this.orgsRepo.findById(instructor.organizationId);
    if (org) {
      await this.orgsRepo.update(org.id, { instructorIds: (org.instructorIds || []).filter((x: string) => x !== id) });
    }
    if (instructor.userId) {
      await this.usersRepo.update(instructor.userId, { organizationId: null, organizationName: null });
    }
    return this.instructorsRepo.update(id, {
      organizationId: null,
      organizationName: null,
      status: 'Pending Affiliation',
      orgJoinedAt: null,
    });
  }
}
