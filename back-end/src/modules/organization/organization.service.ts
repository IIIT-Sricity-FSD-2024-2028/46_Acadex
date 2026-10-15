import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ORGANIZATION)
    private readonly orgRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS)
    private readonly requestsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) { }

  private async resolveOrg(userId?: string, userEmail?: string) {
    const orgs = await this.orgRepo.find();
    if (orgs.length === 0) throw new NotFoundException('Organization details not found');
    if (userEmail) {
      const match = orgs.find((o) => o.email?.toLowerCase() === userEmail.toLowerCase());
      if (match) return match;
    }
    if (userId) {
      const allInstructors = await this.instructorsRepo.find();
      const inst = allInstructors.find((i) => i.userId === userId);
      if (inst?.organizationId) {
        const match = orgs.find((o) => o.id === inst.organizationId);
        if (match) return match;
      }
    }
    return orgs[0];
  }

  async getProfile(userId?: string, userEmail?: string) {
    return this.resolveOrg(userId, userEmail);
  }

  async updateProfile(dto: UpdateOrganizationDto, userId?: string, userEmail?: string) {
    const org = await this.resolveOrg(userId, userEmail);
    return this.orgRepo.update(org.id, dto);
  }

  /**
   * Recomputes coursesCount, totalRevenue, and monthlyRevenue
   * from the live data files and writes them back into organizations.json.
   * Call this after any mutation that affects these fields.
   */
  async syncCounts() {
    const orgs = await this.orgRepo.find();
    if (orgs.length === 0) throw new NotFoundException('No organization found to sync');

    const [courses, instructors, enrollments] = await Promise.all([
      this.coursesRepo.find(),
      this.instructorsRepo.find(),
      this.enrollmentsRepo.find(),
    ]);

    const courseOrganizationIds = new Map<string, string>();
    await Promise.all(courses.map(async (course) => {
      const organizationId = this.resolveOrganizationId(course, instructors, orgs);
      if (!organizationId) return;
      courseOrganizationIds.set(course.id, organizationId);
      if (course.organizationId !== organizationId) {
        await this.coursesRepo.update(course.id, { organizationId });
      }
    }));

    await Promise.all(enrollments.map(async (enrollment) => {
      const organizationId = courseOrganizationIds.get(enrollment.courseId);
      if (organizationId && enrollment.organizationId !== organizationId) {
        await this.enrollmentsRepo.update(enrollment.id, { organizationId });
      }
    }));

    const synced = await Promise.all(orgs.map(async (org) => {
      const organizationCourses = courses.filter((course) => courseOrganizationIds.get(course.id) === org.id);
      const coursesCount = organizationCourses.length;
      const learnerIds = new Set(
        enrollments
          .filter((enrollment) => courseOrganizationIds.get(enrollment.courseId) === org.id)
          .map((enrollment) => enrollment.learnerId)
          .filter(Boolean),
      );

      // Revenue is always calculated from the number of learners and the price
      // of the course they enrolled in; the old course/organization revenue
      // values are deliberately not used as an input.
      const totalRevenue = Math.round(organizationCourses.reduce(
        (sum: number, course: any) =>
          sum + (Number(course.enrolledCount) || 0) * (Number(course.price) || 0),
        0,
      ));
      const monthlyRevenue = Math.round(totalRevenue * 0.3);
      if (
        org.coursesCount === coursesCount &&
        org.learnersCount === learnerIds.size &&
        org.totalRevenue === totalRevenue &&
        org.monthlyRevenue === monthlyRevenue
      ) {
        return org;
      }

      return this.orgRepo.update(org.id, {
        coursesCount,
        learnersCount: learnerIds.size,
        totalRevenue,
        monthlyRevenue,
        updatedAt: new Date().toISOString(),
      });
    }));

    return { synced: synced.filter(Boolean) };
  }

  /** Adds one paid enrollment to the owning organization's stored revenue. */
  async addEnrollmentRevenue(course: any) {
    const [organizations, instructors] = await Promise.all([
      this.orgRepo.find(),
      this.instructorsRepo.find(),
    ]);
    const organizationId = this.resolveOrganizationId(course, instructors, organizations);
    const organization = organizations.find((org) => org.id === organizationId);
    if (!organization) return null;

    const coursePrice = Number(course.price) || 0;
    if (coursePrice <= 0) return organization;

    const totalRevenue = Math.round((Number(organization.totalRevenue) || 0) + coursePrice);
    const monthlyRevenue = Math.round((Number(organization.monthlyRevenue) || 0) + coursePrice);
    return this.orgRepo.update(organization.id, { totalRevenue, monthlyRevenue });
  }

  private resolveOrganizationId(course: any, instructors: any[], organizations: any[]): string | undefined {
    if (course.organizationId && organizations.some((org) => org.id === course.organizationId)) {
      return course.organizationId;
    }

    const leadInstructor = instructors.find((instructor) => instructor.id === course.instructorId);
    if (leadInstructor?.organizationId && organizations.some((org) => org.id === leadInstructor.organizationId)) {
      return leadInstructor.organizationId;
    }

    return organizations.find((org) => org.instructorIds?.includes(course.instructorId))?.id;
  }

  async getStats(userId?: string, userEmail?: string) {
    const org = await this.resolveOrg(userId, userEmail);
    const [allCourses, allEnrollments, allInstructors, pendingRequests, unreadNotifs] = await Promise.all([
      this.coursesRepo.find(),
      this.enrollmentsRepo.find(),
      this.instructorsRepo.find(),
      this.requestsRepo.count({ status: { $regex: /pending|sent/i } }),
      this.notifsRepo.count({ read: false }),
    ]);

    const organizations = await this.orgRepo.find();
    const courses = allCourses.filter(
      (course) => this.resolveOrganizationId(course, allInstructors, organizations) === org.id,
    );
    const courseIds = new Set(courses.map((course) => course.id));
    const enrollments = allEnrollments.filter((enrollment) => courseIds.has(enrollment.courseId));
    const totalInstructors = allInstructors.filter((instructor) => instructor.organizationId === org.id).length;
    const totalLearners = await this.learnersRepo.count({ organizationId: org.id });
    const completedEnrollments = enrollments.filter(
      (enrollment) => enrollment.status === 'Completed' || enrollment.progress === 100,
    ).length;
    const activeEnrollments = enrollments.filter(
      (enrollment) => enrollment.status === 'Active' && (enrollment.progress || 0) < 100,
    ).length;
    const annualRevenue = Math.round(courses.reduce(
      (sum, course) => sum + (Number(course.enrolledCount) || 0) * (Number(course.price) || 0),
      0,
    ));
    const ratedCourses = courses.filter((course) => Number(course.rating) > 0);

    return {
      totalInstructors,
      totalLearners,
      activeCourses: courses.filter((course) => course.status === 'Published').length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      activeEnrollments,
      completedEnrollments,
      pendingRequests,
      unreadNotifications: unreadNotifs,
      annualRevenue,
      monthlyRevenue: Math.round(annualRevenue * 0.3),
      completionRate: enrollments.length ? Math.round((completedEnrollments / enrollments.length) * 100) : null,
      averageRating: ratedCourses.length
        ? Number((ratedCourses.reduce((sum, course) => sum + Number(course.rating), 0) / ratedCourses.length).toFixed(1))
        : null,
      currency: 'USD',
    };
  }

  async findAllOrgs() {
    const [orgs, allInstructors] = await Promise.all([
      this.orgRepo.find(),
      this.instructorsRepo.find(),
    ]);

    return orgs.map((org) => {
      // Match instructors belonging to this organization
      const associatedInstructors = allInstructors.filter((inst) => {
        if (org.instructorIds && Array.isArray(org.instructorIds)) {
          if (org.instructorIds.includes(inst.id)) return true;
        }
        if (org.name && inst.bio && inst.bio.toLowerCase().includes(org.name.toLowerCase())) return true;
        if (org.email && inst.email) {
          const orgDomain = org.email.split('@')[1];
          const instDomain = inst.email.split('@')[1];
          if (orgDomain && instDomain && orgDomain === instDomain) return true;
        }
        return false;
      });

      const grossRevenue = Number(org.totalRevenue) || 0;
      const orgShare85 = Math.round(grossRevenue * 0.85);
      const superAdminShare15 = Math.round(grossRevenue * 0.15);

      return {
        ...org,
        instructors: associatedInstructors,
        instructorsCount: associatedInstructors.length || (org.instructorIds ? org.instructorIds.length : 1),
        financials: {
          grossRevenue,
          orgShare85,
          superAdminShare15,
          orgPercentage: 85,
          superAdminPercentage: 15,
          currency: org.currency || 'USD',
        },
      };
    });
  }

  async findOrgById(id: string) {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      const allOrgs = await this.orgRepo.find();
      const match = allOrgs.find((o) => o.id === id);
      if (!match) throw new NotFoundException(`Organization with ID '${id}' not found`);
      return match;
    }
    const allInstructors = await this.instructorsRepo.find();
    const associatedInstructors = allInstructors.filter((inst) =>
      org.instructorIds?.includes(inst.id)
    );
    const grossRevenue = Number(org.totalRevenue) || 0;
    return {
      ...org,
      instructors: associatedInstructors,
      financials: {
        grossRevenue,
        orgShare85: Math.round(grossRevenue * 0.85),
        superAdminShare15: Math.round(grossRevenue * 0.15),
        orgPercentage: 85,
        superAdminPercentage: 15,
        currency: org.currency || 'USD',
      },
    };
  }

  async createOrg(dto: any) {
    const newId = `org-${Date.now().toString().slice(-4)}`;
    const newOrg = await this.orgRepo.create({
      id: newId,
      name: dto.name || 'New University Partner',
      tagline: dto.tagline || 'Leading Academic Institution',
      email: dto.email || `contact@${newId}.edu`,
      phone: dto.phone || '+1 (555) 019-2831',
      location: dto.location || 'Global Campus',
      address: dto.address || 'Campus Quad, Academic Wing',
      website: dto.website || `https://${newId}.edu`,
      status: dto.status || 'Active',
      establishedYear: dto.establishedYear || new Date().getFullYear(),
      totalRevenue: 0,
      monthlyRevenue: 0,
      currency: dto.currency || 'USD',
      instructorIds: dto.instructorIds || [],
      coursesCount: dto.coursesCount || 2,
      learnersCount: dto.learnersCount || 100,
      logo: dto.logo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newOrg;
  }

  async updateOrg(id: string, dto: any) {
    const existing = await this.orgRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Organization with ID '${id}' not found`);
    }
    const updated = await this.orgRepo.update(id, {
      ...dto,
      updatedAt: new Date().toISOString(),
    });
    return updated;
  }

  async deleteOrg(id: string) {
    const existing = await this.orgRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Organization with ID '${id}' not found`);
    }
    await this.orgRepo.delete(id);
    return { success: true, message: `Organization '${id}' removed` };
  }

  async getStudentJoinRequests(userId?: string, userEmail?: string) {
    const org = await this.resolveOrg(userId, userEmail);
    const learners = await this.learnersRepo.find();
    return learners.filter(
      (l) => l.orgMembershipStatus === 'Pending Organization Approval' && l.requestedOrgId === org.id
    );
  }

  async respondStudentJoinRequest(learnerId: string, action: 'approve' | 'reject', userId?: string, userEmail?: string) {
    const org = await this.resolveOrg(userId, userEmail);
    const learner = await this.learnersRepo.findById(learnerId);
    if (!learner) throw new NotFoundException(`Learner '${learnerId}' not found`);
    if (learner.requestedOrgId !== org.id || learner.orgMembershipStatus !== 'Pending Organization Approval') {
      throw new BadRequestException('This learner has no pending request with your organization');
    }

    const approve = action === 'approve';
    return this.learnersRepo.update(learnerId, {
      orgMembershipStatus: approve ? 'Verified Student' : 'Independent Learner',
      organizationId: approve ? org.id : null,
      organizationName: approve ? org.name : null,
      learnerType: approve ? 'Student' : learner.learnerType,
      requestedOrgId: null,
      requestedOrgName: null,
      orgDecisionAt: new Date().toISOString(),
    });
  }
}
