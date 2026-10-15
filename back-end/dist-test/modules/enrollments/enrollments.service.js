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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
const json_db_service_1 = require("../../database/json-db.service");
let EnrollmentsService = class EnrollmentsService {
    constructor(enrollmentsRepo, coursesRepo, learnersRepo, transactionsRepo, notifsRepo, certificatesRepo, dbService) {
        this.enrollmentsRepo = enrollmentsRepo;
        this.coursesRepo = coursesRepo;
        this.learnersRepo = learnersRepo;
        this.transactionsRepo = transactionsRepo;
        this.notifsRepo = notifsRepo;
        this.certificatesRepo = certificatesRepo;
        this.dbService = dbService;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, learnerId, courseId, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (learnerId)
            where.learnerId = learnerId;
        if (courseId)
            where.courseId = courseId;
        if (status && status !== 'All')
            where.status = status;
        if (search) {
            where.$or = [
                { learnerName: { $contains: search } },
                { courseTitle: { $contains: search } },
                { id: { $contains: search } },
            ];
        }
        return this.enrollmentsRepo.findAndCount({
            where,
            skip,
            limit,
            sort: { [sortBy]: sortOrder },
        });
    }
    async findOne(id) {
        const enrollment = await this.enrollmentsRepo.findById(id);
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID '${id}' not found`);
        }
        return enrollment;
    }
    async createSingle(data) {
        const { learnerId, courseId, learnerName, courseTitle } = data;
        if (!learnerId || !courseId) {
            throw new common_1.BadRequestException('learnerId and courseId are required');
        }
        const existing = await this.enrollmentsRepo.find({ where: { learnerId, courseId } });
        if (existing.length > 0) {
            return existing[0];
        }
        const course = await this.coursesRepo.findById(courseId).catch(() => null);
        return this.enrollmentsRepo.create({
            learnerId,
            courseId,
            learnerName: learnerName || '',
            courseTitle: courseTitle || course?.title || '',
            status: 'Active',
            progress: 0,
            enrolledDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });
    }
    async assignCoursesToLearners(dto) {
        if (!dto.courseIds?.length || !dto.learnerIds?.length) {
            throw new common_1.BadRequestException('courseIds and learnerIds must not be empty');
        }
        return this.dbService.runTransaction(async () => {
            const allCourses = await this.coursesRepo.find();
            const allLearners = await this.learnersRepo.find();
            const targetCourses = allCourses.filter((c) => dto.courseIds.includes(c.id));
            const targetLearners = allLearners.filter((l) => dto.learnerIds.includes(l.id));
            if (targetCourses.length === 0) {
                throw new common_1.NotFoundException('None of the specified courses were found');
            }
            if (targetLearners.length === 0) {
                throw new common_1.NotFoundException('None of the specified learners were found');
            }
            const createdEnrollments = [];
            const createdTransactions = [];
            const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const nowIso = new Date().toISOString();
            for (const course of targetCourses) {
                if (!course.organizationId) {
                    throw new common_1.BadRequestException(`Course "${course.title}" must belong to an organization before enrollment`);
                }
                if (!course.instructors?.length && !course.instructorId) {
                    throw new common_1.BadRequestException(`Course "${course.title}" must have at least one instructor before enrollment`);
                }
                for (const learner of targetLearners) {
                    const existing = await this.enrollmentsRepo.findOne({
                        learnerId: learner.id,
                        courseId: course.id,
                    });
                    if (!existing) {
                        const enrId = `ENR-${Math.floor(100000 + Math.random() * 900000)}`;
                        const enrollment = await this.enrollmentsRepo.create({
                            id: enrId,
                            learnerId: learner.id,
                            learnerName: learner.name,
                            learnerAvatar: learner.avatar,
                            courseId: course.id,
                            courseTitle: course.title,
                            enrolledDate: dateStr,
                            progress: 0,
                            status: 'Active',
                            lastAccessed: dateStr,
                            createdAt: nowIso,
                        });
                        createdEnrollments.push(enrollment);
                        const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
                        const transaction = await this.transactionsRepo.create({
                            id: txnId,
                            payer: learner.name,
                            payerId: learner.id,
                            course: course.title,
                            courseId: course.id,
                            amount: course.price,
                            type: 'Payment',
                            organizationId: course.organizationId || null,
                            organizationName: course.organizationName || null,
                            method: course.organizationName ? `${course.organizationName} Billing` : 'Platform Billing',
                            date: `${dateStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                            status: 'Completed',
                            createdAt: nowIso,
                            updatedAt: nowIso,
                        });
                        createdTransactions.push(transaction);
                    }
                }
                const additionalSeats = targetLearners.length;
                await this.coursesRepo.update(course.id, {
                    enrolledCount: (course.enrolledCount || 0) + additionalSeats,
                    revenue: (course.revenue || 0) + course.price * additionalSeats,
                });
            }
            for (const learner of targetLearners) {
                await this.learnersRepo.update(learner.id, {
                    enrolledCourses: (learner.enrolledCourses || 0) + targetCourses.length,
                    totalSpent: (learner.totalSpent || 0) + targetCourses.reduce((sum, c) => sum + c.price, 0),
                });
            }
            await this.notifsRepo.create({
                title: `Batch Course Assignment Completed`,
                desc: `Enrolled ${targetLearners.length} learner(s) into ${targetCourses.length} course track(s).`,
                time: 'Just now',
                category: 'Course',
                read: false,
                color: 'green',
            });
            return {
                totalAssigned: createdEnrollments.length,
                enrollments: createdEnrollments,
                transactions: createdTransactions,
            };
        });
    }
    async updateProgress(id, dto) {
        const enrollment = await this.enrollmentsRepo.findById(id);
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID '${id}' not found`);
        }
        const isCompleted = dto.progress >= 100;
        const updated = await this.enrollmentsRepo.update(id, {
            progress: dto.progress,
            status: isCompleted ? 'Completed' : enrollment.status,
            lastAccessed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
        if (isCompleted && enrollment.status !== 'Completed') {
            const learner = await this.learnersRepo.findById(enrollment.learnerId);
            const course = await this.coursesRepo.findById(enrollment.courseId);
            if (learner) {
                await this.learnersRepo.update(learner.id, {
                    completedCourses: (learner.completedCourses || 0) + 1,
                    certificatesEarned: (learner.certificatesEarned || 0) + 1,
                });
            }
            const existingCert = await this.certificatesRepo.findOne({
                learnerId: enrollment.learnerId,
                courseId: enrollment.courseId,
            });
            if (!existingCert) {
                const tag = (enrollment.courseId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                const rand = Math.floor(100000 + Math.random() * 900000);
                const credentialId = `NX-${tag}-${rand}`;
                const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                const cert = await this.certificatesRepo.create({
                    id: `cert-${Date.now()}`,
                    learnerId: enrollment.learnerId,
                    learnerName: enrollment.learnerName,
                    courseId: enrollment.courseId,
                    courseTitle: enrollment.courseTitle,
                    institution: course?.organizationName || 'Platform',
                    category: 'Course Certificates',
                    issueDate,
                    issuedAt: new Date().toISOString(),
                    credentialId,
                    status: 'Verified',
                    grade: 'Completed',
                    skills: course?.modules?.map((m) => m.title).slice(0, 4) || [],
                    instructorSignature: course?.leadInstructorName || course?.instructorName || '',
                    certificateUrl: `https://platform.io/verify/${credentialId}`,
                });
                await this.enrollmentsRepo.update(id, { certificateId: cert.credentialId });
            }
            await this.notifsRepo.create({
                title: 'Course Completed',
                desc: `${enrollment.learnerName} completed "${enrollment.courseTitle}" and received a certificate.`,
                time: 'Just now',
                category: 'Certificate',
                read: false,
                color: 'green',
            });
        }
        return updated;
    }
    async updateStatus(id, dto) {
        const enrollment = await this.enrollmentsRepo.findById(id);
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID '${id}' not found`);
        }
        return this.enrollmentsRepo.update(id, { status: dto.status });
    }
    async delete(id) {
        const enrollment = await this.enrollmentsRepo.findById(id);
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID '${id}' not found`);
        }
        return this.enrollmentsRepo.delete(id);
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.TRANSACTIONS)),
    __param(4, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.NOTIFICATIONS)),
    __param(5, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.CERTIFICATES)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_db_service_1.JsonDatabaseService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map