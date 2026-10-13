import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CreateInstructorDto, InstructorQueryDto, UpdateInstructorDto } from './dto/instructor.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class InstructorsService {
  constructor(
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

    return this.instructorsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const instructor = await this.instructorsRepo.findById(id);
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID '${id}' not found`);
    }

    // Populate instructor courses
    const courses = await this.coursesRepo.find({
      where: {
        $or: [
          { instructorId: id },
          { 'instructors.id': id },
        ],
      },
    });

    return {
      ...instructor,
      courses,
    };
  }

  async create(dto: CreateInstructorDto) {
    const newInstructor = await this.instructorsRepo.create({
      ...dto,
      coursesCount: 0,
      enrolledStudents: 0,
      avgRating: dto.avgRating || 5.0,
      revenueGenerated: 0,
      status: dto.status || 'Active',
      avatar: dto.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
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

  async connectUniversity(id: string, organizationId: string, organizationName?: string) {
    const instructor = await this.instructorsRepo.findById(id);
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID '${id}' not found`);
    }

    let finalName = organizationName;
    if (!finalName) {
      const org = await this.orgsRepo.findById(organizationId);
      finalName = org?.name || 'Partner University';
    }

    const updated = await this.instructorsRepo.update(id, {
      organizationId,
      organizationName: finalName,
      status: 'Active',
    });

    if (instructor.userId) {
      await this.usersRepo.update(instructor.userId, {
        organizationId,
        organizationName: finalName,
        status: 'Active',
      });
    } else {
      const user = await this.usersRepo.findOne({ email: instructor.email });
      if (user) {
        await this.usersRepo.update(user.id, {
          organizationId,
          organizationName: finalName,
          status: 'Active',
        });
      }
    }

    const org = await this.orgsRepo.findById(organizationId);
    if (org) {
      const roster = org.instructorIds || [];
      if (!roster.includes(id)) {
        await this.orgsRepo.update(organizationId, {
          instructorIds: [...roster, id],
        });
      }
    }

    return updated;
  }
}
