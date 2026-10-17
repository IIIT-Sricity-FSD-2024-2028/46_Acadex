import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import { UserEntity } from '../../database/schema';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepo: JsonRepository<UserEntity>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATIONS) private readonly orgsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES) private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS) private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS) private readonly transactionsRepo: JsonRepository<any>,
    private readonly db: JsonDatabaseService,
  ) {}

  private publicUser(user: any) {
    const { password, passwordHash, ...record } = user;
    return { ...record, role: ['Student', 'Learner'].includes(record.role) ? 'Learner' : record.role };
  }

  async getActivity() { return new JsonRepository<any>('admin_activity', this.db).find(); }

  async recordActivity(data: any) {
    return new JsonRepository<any>('admin_activity', this.db).create({ ...data, resolvedAt: new Date().toISOString() });
  }

  async findAll(role?: string) {
    const users = (await this.usersRepo.find()).map(user => this.publicUser(user));
    if (!role) return users;
    const lower = role.toLowerCase() === 'student' ? 'learner' : role.toLowerCase();
    return users.filter(u => u.role?.toLowerCase() === lower);
  }

  async findOne(id: string) {
    const [users, learners, instructors, orgs, courses, enrollments, transactions] = await Promise.all([
      this.usersRepo.find(), this.learnersRepo.find(), this.instructorsRepo.find(), this.orgsRepo.find(),
      this.coursesRepo.find(), this.enrollmentsRepo.find(), this.transactionsRepo.find(),
    ]);
    let account: any = users.find(u => u.id === id);
    if (!account) {
      const learner = learners.find(l => l.id === id);
      const instructor = instructors.find(i => i.id === id);
      const org = orgs.find(o => o.id === id);
      const profile = learner || instructor || org;
      if (!profile) throw new NotFoundException(`User '${id}' not found`);
      account = { ...profile, role: learner ? 'Learner' : instructor ? 'Instructor' : 'Organization' };
    }
    const matches = (record: any) => record.id === account.id || record.userId === account.id ||
      (!!record.email && record.email.toLowerCase() === account.email?.toLowerCase());
    const learner = learners.find(matches);
    const instructor = instructors.find(matches);
    const org = orgs.find(o => o.id === account.organizationId || matches(o));
    const role = this.publicUser(account).role;
    const profile = role === 'Learner' ? learner : role === 'Instructor' ? instructor : role === 'Organization' ? org : null;
    const linkedIds = [account.id, profile?.id].filter(Boolean);
    const faculty = role === 'Organization' && org ? instructors.filter(i => i.organizationId === org?.id || org?.instructorIds?.includes(i.id)) : [];
    const relatedCourses = courses.filter(c => role === 'Instructor'
      ? linkedIds.includes(c.instructorId) || c.instructors?.some(i => linkedIds.includes(i.id))
      : role === 'Organization' && !!org && (c.organizationId === org?.id || (!c.organizationId && faculty.some(i => i.id === c.instructorId))));
    const ownEnrollments = role === 'Learner' ? enrollments.filter(e => linkedIds.includes(e.learnerId) || linkedIds.includes(e.userId) ||
      (!!e.learnerEmail && e.learnerEmail.toLowerCase() === account.email?.toLowerCase())) : [];
    const orgCourseIds = new Set(relatedCourses.map(c => c.id));
    const enrolledIds = new Set(enrollments.filter(e => orgCourseIds.has(e.courseId)).map(e => e.learnerId));
    const orgLearners = role === 'Organization' && org ? learners.filter(l => l.organizationId === org?.id || enrolledIds.has(l.id)) : [];
    const ownTransactions = transactions.filter(t => role === 'Organization' ? !!org && (t.organizationId === org.id || orgCourseIds.has(t.courseId)) :
      linkedIds.includes(t.learnerId) || linkedIds.includes(t.payerId) || linkedIds.includes(t.userId) ||
      (!!t.payerEmail && t.payerEmail.toLowerCase() === account.email?.toLowerCase()));
    return { ...this.publicUser({ ...account, ...profile, id: account.id, status: account.status ?? profile?.status, role }),
      enrollments: ownEnrollments.map(e => {
        const course = courses.find(c => c.id === e.courseId);
        return { ...e, course: course?.title || e.courseTitle || e.course,
          organization: orgs.find(o => o.id === (course?.organizationId || e.organizationId))?.name || '',
          instructor: instructors.find(i => i.id === (course?.instructorId || e.instructorId))?.name || '' };
      }),
      courses: relatedCourses.map(c => ({ ...c, students: enrollments.filter(e => e.courseId === c.id).length, createdDate: c.createdAt?.slice(0, 10) })),
      transactions: ownTransactions,
      orgInstructors: faculty.map(i => ({ ...i, expertise: i.specialization || i.department, courses: relatedCourses.filter(c => c.instructorId === i.id || c.instructors?.some(ci => ci.id === i.id)).length })),
      orgLearners, coursesCount: relatedCourses.length, instructorsCount: faculty.length, learnersCount: orgLearners.length,
    };
  }

  async create(dto: CreateUserDto) {
    const newUser = await this.usersRepo.create({
      id: `usr-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      role: (dto.role as any) || 'Student',
      status: (dto.status as any) || 'Active',
      verificationStatus: (dto.verificationStatus as any) || 'Verified',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    });
    return this.publicUser(newUser);
  }

  async update(id: string, dto: UpdateUserDto) {
    const updated = await this.usersRepo.update(id, dto as any);
    if (!updated) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    if (dto.status) {
      if (['Student', 'Learner'].includes(updated.role)) {
        const learner = (await this.learnersRepo.findOne({ userId: id })) || (await this.learnersRepo.findOne({ email: updated.email }));
        if (learner) {
          await this.learnersRepo.update(learner.id, { status: dto.status });
        }
      } else if (updated.role === 'Organization') {
        const org = (await this.orgsRepo.findOne({ userId: id })) || (await this.orgsRepo.findOne({ email: updated.email }));
        if (org) {
          await this.orgsRepo.update(org.id, { status: dto.status });
        }
      }
    }

    return this.publicUser(updated);
  }

  async remove(id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    if (user.role === 'Instructor') {
      throw new BadRequestException('Instructors cannot be removed directly by Platform Admin. Only affiliated organizations can manage instructor appointments.');
    }

    if (user.role === 'Admin' || user.role === 'SuperAdmin') {
      throw new BadRequestException('Platform Admin accounts are protected from direct removal.');
    }

    if (user.role === 'Organization') {
      const org = (await this.orgsRepo.findOne({ userId: id })) || (await this.orgsRepo.findOne({ email: user.email }));
      if (org) {
        await this.orgsRepo.delete(org.id);
      }
    }

    if (['Student', 'Learner'].includes(user.role)) {
      const learner = (await this.learnersRepo.findOne({ userId: id })) || (await this.learnersRepo.findOne({ email: user.email }));
      if (learner) {
        await this.learnersRepo.delete(learner.id);
      }
    }

    await this.usersRepo.delete(id);
    return { success: true, message: `User '${id}' permanently removed` };
  }
}
