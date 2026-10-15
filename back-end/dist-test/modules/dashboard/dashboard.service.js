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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let DashboardService = class DashboardService {
    constructor(orgRepo, instructorsRepo, learnersRepo, coursesRepo, enrollmentsRepo, transactionsRepo, requestsRepo, notifsRepo) {
        this.orgRepo = orgRepo;
        this.instructorsRepo = instructorsRepo;
        this.learnersRepo = learnersRepo;
        this.coursesRepo = coursesRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.transactionsRepo = transactionsRepo;
        this.requestsRepo = requestsRepo;
        this.notifsRepo = notifsRepo;
    }
    async getOverview() {
        const [org, instructorsCount, learnersCount, courses, enrollments, transactions, pendingRequests, recentNotifications,] = await Promise.all([
            this.orgRepo.find(),
            this.instructorsRepo.count(),
            this.learnersRepo.count(),
            this.coursesRepo.find(),
            this.enrollmentsRepo.find({ limit: 10, sort: { createdAt: 'desc' } }),
            this.transactionsRepo.find({ limit: 8, sort: { createdAt: 'desc' } }),
            this.requestsRepo.find({
                where: { status: { $regex: /pending|sent/i } },
                limit: 5,
            }),
            this.notifsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
        ]);
        const activeCourses = courses.filter((c) => c.status === 'Published').length;
        const annualRevenue = courses.reduce((sum, c) => sum + (c.revenue || 0), 0);
        const monthlyRevenue = Math.round(annualRevenue * 0.3);
        const organizationInfo = org[0] || {};
        return {
            organization: organizationInfo,
            kpis: {
                totalInstructors: instructorsCount,
                totalLearners: learnersCount,
                activeCourses,
                totalEnrollments: (await this.enrollmentsRepo.count()),
                annualRevenue,
                monthlyRevenue,
                pendingRequestsCount: pendingRequests.length,
                averageRating: null,
                completionRate: null,
            },
            recentEnrollments: enrollments,
            recentTransactions: transactions,
            pendingInvitations: pendingRequests,
            recentNotifications,
            topPerformingCourses: courses.slice(0, 4).map((c) => ({
                id: c.id,
                title: c.title,
                category: c.category,
                enrolledCount: c.enrolledCount || 0,
                rating: c.rating || 0,
                revenue: c.revenue || 0,
                status: c.status,
            })),
        };
    }
    async getRecentActivity() {
        const [enrollments, transactions, notifications, requests] = await Promise.all([
            this.enrollmentsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
            this.transactionsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
            this.notifsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
            this.requestsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
        ]);
        return {
            enrollments,
            transactions,
            notifications,
            requests,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ORGANIZATION)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(4, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __param(5, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.TRANSACTIONS)),
    __param(6, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS)),
    __param(7, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.NOTIFICATIONS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map