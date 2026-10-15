"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
const PAYMENT_METHODS = ['card', 'upi'];
let StudentService = class StudentService {
    constructor(learnersRepo, enrollmentsRepo, coursesRepo, certificatesRepo, transactionsRepo, orgsRepo, notifsRepo) {
        this.learnersRepo = learnersRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.coursesRepo = coursesRepo;
        this.certificatesRepo = certificatesRepo;
        this.transactionsRepo = transactionsRepo;
        this.orgsRepo = orgsRepo;
        this.notifsRepo = notifsRepo;
    }
    async resolveLearner(userId) {
        if (!userId)
            throw new common_1.NotFoundException('Missing x-user-id header');
        let learner = await this.learnersRepo.findById(userId);
        if (!learner) {
            const all = await this.learnersRepo.find();
            learner = all.find((l) => l.userId === userId || l.email === userId) || null;
        }
        if (!learner)
            throw new common_1.NotFoundException(`Learner '${userId}' not found`);
        return learner;
    }
    hasInstructor(course) {
        return Boolean(course?.instructorId || course?.instructors?.length);
    }
    isAvailable(course) {
        return course && course.status === 'Published' && this.hasInstructor(course);
    }
    lessonIdsFor(course) {
        const ids = [];
        for (const mod of course?.modules || []) {
            const count = Array.isArray(mod.lessons) ? mod.lessons.length : Number(mod.lessons) || 0;
            for (let i = 1; i <= count; i++)
                ids.push(`${mod.id}-l${i}`);
        }
        return ids;
    }
    async getProfile(userId) {
        const learner = await this.resolveLearner(userId);
        const [enrollments, certificates] = await Promise.all([
            this.enrollmentsRepo.find({ where: { learnerId: learner.id } }),
            this.certificatesRepo.find({ where: { learnerId: learner.id } }),
        ]);
        const completed = enrollments.filter((e) => e.status === 'Completed').length;
        return {
            ...learner,
            orgMembershipStatus: learner.orgMembershipStatus || 'Independent Learner',
            enrolledCourses: enrollments.length,
            inProgressCourses: enrollments.length - completed,
            completedCourses: completed,
            certificatesEarned: certificates.length,
        };
    }
    async updateProfile(userId, dto) {
        const learner = await this.resolveLearner(userId);
        const allowed = {};
        for (const key of ['name', 'title', 'location', 'bio', 'phone']) {
            if (dto[key] !== undefined)
                allowed[key] = String(dto[key]).trim();
        }
        if (allowed.name !== undefined && allowed.name.length < 2) {
            throw new common_1.BadRequestException('Name must be at least 2 characters');
        }
        await this.learnersRepo.update(learner.id, { ...allowed, updatedAt: new Date().toISOString() });
        return this.getProfile(userId);
    }
    async requestJoinOrganization(userId, orgId, orgName) {
        const learner = await this.resolveLearner(userId);
        const org = await this.orgsRepo.findById(orgId);
        if (!org)
            throw new common_1.NotFoundException(`Organization '${orgId}' not found`);
        await this.learnersRepo.update(learner.id, {
            orgMembershipStatus: 'Pending Organization Approval',
            requestedOrgId: org.id,
            requestedOrgName: org.name || orgName,
            requestedAt: new Date().toISOString(),
        });
        return this.getProfile(userId);
    }
    async getOrganizationsList() {
        return this.orgsRepo.find();
    }
    async getCatalog() {
        const courses = await this.coursesRepo.find();
        return courses.filter((c) => this.isAvailable(c));
    }
    async getCatalogCourse(courseId) {
        const course = await this.coursesRepo.findById(courseId);
        if (!this.isAvailable(course))
            throw new common_1.NotFoundException(`Course '${courseId}' is not available`);
        return course;
    }
    async getEnrollments(userId) {
        const learner = await this.resolveLearner(userId);
        const enrollments = await this.enrollmentsRepo.find({ where: { learnerId: learner.id } });
        const courses = await this.coursesRepo.find();
        return enrollments
            .map((enr) => {
            const course = courses.find((c) => c.id === enr.courseId);
            if (!course || !this.hasInstructor(course))
                return null;
            const totalLessons = this.lessonIdsFor(course).length;
            return {
                ...enr,
                courseTitle: course.title,
                category: course.category,
                description: course.description,
                thumbnail: course.thumbnail,
                institution: course.organizationName || '',
                instructorName: course.leadInstructorName || course.instructorName || '',
                totalLessons,
                completedLessons: enr.completedLessons || [],
                progress: typeof enr.progress === 'number' ? enr.progress : 0,
            };
        })
            .filter(Boolean);
    }
    async getEnrollmentForCourse(userId, courseId) {
        const all = await this.getEnrollments(userId);
        const enrollment = all.find((e) => e.courseId === courseId);
        if (!enrollment)
            throw new common_1.NotFoundException('You are not enrolled in this course');
        return enrollment;
    }
    async createEnrollment(learner, course) {
        const now = new Date();
        const enrollment = await this.enrollmentsRepo.create({
            id: `enr-${Date.now()}`,
            learnerId: learner.id,
            learnerName: learner.name,
            learnerEmail: learner.email,
            courseId: course.id,
            courseTitle: course.title,
            organizationId: course.organizationId || null,
            instructorId: course.instructorId || course.instructors?.[0]?.id || null,
            enrolledDate: now.toISOString().split('T')[0],
            enrolledAt: now.toISOString(),
            progress: 0,
            status: 'Active',
            completedLessons: [],
            lastAccessedAt: null,
        });
        await this.coursesRepo.update(course.id, {
            enrolledCount: (course.enrolledCount || 0) + 1,
        });
        return enrollment;
    }
    async assertNotEnrolled(learnerId, courseId) {
        const existing = await this.enrollmentsRepo.findOne({ learnerId, courseId });
        if (existing)
            throw new common_1.ConflictException('You are already enrolled in this course');
    }
    async enrollCourse(userId, courseId) {
        const learner = await this.resolveLearner(userId);
        const course = await this.getCatalogCourse(courseId);
        if (Number(course.price) > 0) {
            throw new common_1.BadRequestException('This is a paid course. Complete checkout to enroll.');
        }
        await this.assertNotEnrolled(learner.id, course.id);
        return this.createEnrollment(learner, course);
    }
    async updateProgress(userId, enrollmentId, lessonId, completed) {
        const learner = await this.resolveLearner(userId);
        const enrollment = await this.enrollmentsRepo.findById(enrollmentId);
        if (!enrollment)
            throw new common_1.NotFoundException(`Enrollment '${enrollmentId}' not found`);
        if (enrollment.learnerId !== learner.id)
            throw new common_1.ForbiddenException('Not your enrollment');
        const course = await this.coursesRepo.findById(enrollment.courseId);
        const lessonIds = this.lessonIdsFor(course);
        if (!lessonIds.includes(lessonId))
            throw new common_1.BadRequestException(`Unknown lesson '${lessonId}'`);
        const done = new Set((enrollment.completedLessons || []).filter((id) => lessonIds.includes(id)));
        if (completed)
            done.add(lessonId);
        else
            done.delete(lessonId);
        const progress = lessonIds.length ? Math.round((done.size / lessonIds.length) * 100) : 0;
        const nowCompleted = progress >= 100;
        const now = new Date().toISOString();
        await this.enrollmentsRepo.update(enrollmentId, {
            completedLessons: Array.from(done),
            progress,
            status: nowCompleted ? 'Completed' : 'Active',
            lastAccessedAt: now,
            ...(nowCompleted && enrollment.status !== 'Completed' ? { completedAt: now } : {}),
        });
        if (nowCompleted)
            await this.issueCertificate(learner, enrollment, course);
        return this.getEnrollmentForCourse(userId, enrollment.courseId);
    }
    async issueCertificate(learner, enrollment, course) {
        const existing = await this.certificatesRepo.findOne({ learnerId: learner.id, courseId: course.id });
        if (existing)
            return existing;
        const tag = course.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const credentialId = `NX-${tag}-${Math.floor(100000 + Math.random() * 900000)}`;
        const issuedAt = new Date();
        const cert = await this.certificatesRepo.create({
            id: `cert-${Date.now()}`,
            learnerId: learner.id,
            learnerName: learner.name,
            courseId: course.id,
            courseTitle: course.title,
            institution: course.organizationName || '',
            organizationId: course.organizationId || null,
            instructorName: course.leadInstructorName || course.instructorName || '',
            category: course.category || '',
            skills: (course.modules || []).map((m) => m.title).slice(0, 4),
            issueDate: issuedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            issuedAt: issuedAt.toISOString(),
            credentialId,
            status: 'Verified',
            grade: 'Completed',
        });
        await this.enrollmentsRepo.update(enrollment.id, { certificateId: cert.credentialId });
        await this.notifsRepo.create({
            title: 'Course Completed',
            desc: `${learner.name} completed "${course.title}" and received a certificate.`,
            time: 'Just now',
            category: 'Certificate',
            read: false,
            color: 'green',
            learnerId: learner.id,
        });
        return cert;
    }
    async getCertificates(userId) {
        const learner = await this.resolveLearner(userId);
        return this.certificatesRepo.find({ where: { learnerId: learner.id } });
    }
    async getPayments(userId) {
        const learner = await this.resolveLearner(userId);
        const txs = await this.transactionsRepo.find({ where: { payerId: learner.id } });
        return txs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    async checkout(userId, dto) {
        const learner = await this.resolveLearner(userId);
        const course = await this.getCatalogCourse(dto.courseId);
        await this.assertNotEnrolled(learner.id, course.id);
        const method = String(dto.paymentMethod || '').toLowerCase();
        if (!PAYMENT_METHODS.includes(method)) {
            throw new common_1.BadRequestException('Payment method must be card or upi');
        }
        if (method === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(dto.upiId || '')) {
            throw new common_1.BadRequestException('A valid UPI ID is required (e.g. name@bank)');
        }
        if (method === 'card' && !/^\d{4}$/.test(dto.cardLast4 || '')) {
            throw new common_1.BadRequestException('Card details are incomplete');
        }
        const now = new Date().toISOString();
        const methodLabel = method === 'upi' ? `UPI (${dto.upiId})` : `Card •••• ${dto.cardLast4}`;
        const transaction = await this.transactionsRepo.create({
            id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            type: 'Payment',
            payerId: learner.id,
            payer: learner.name,
            courseId: course.id,
            course: course.title,
            organizationId: course.organizationId || null,
            organizationName: course.organizationName || null,
            amount: Number(course.price) || 0,
            method: methodLabel,
            date: now,
            status: 'Completed',
            createdAt: now,
            updatedAt: now,
        });
        const enrollment = await this.createEnrollment(learner, course);
        await this.coursesRepo.update(course.id, {
            revenue: (course.revenue || 0) + (Number(course.price) || 0),
        });
        return {
            success: true,
            transactionId: transaction.id,
            enrollmentId: enrollment.id,
            courseId: course.id,
            courseTitle: course.title,
            amount: transaction.amount,
            method: methodLabel,
            date: now,
        };
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.CERTIFICATES)),
    __param(4, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.TRANSACTIONS)),
    __param(5, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ORGANIZATION)),
    __param(6, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.NOTIFICATIONS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], StudentService);
//# sourceMappingURL=student.service.js.map