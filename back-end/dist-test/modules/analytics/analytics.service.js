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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let AnalyticsService = class AnalyticsService {
    constructor(coursesRepo, learnersRepo, enrollmentsRepo, transactionsRepo, instructorsRepo, usersRepo, orgRepo, disputesRepo, reviewsRepo) {
        this.coursesRepo = coursesRepo;
        this.learnersRepo = learnersRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.transactionsRepo = transactionsRepo;
        this.instructorsRepo = instructorsRepo;
        this.usersRepo = usersRepo;
        this.orgRepo = orgRepo;
        this.disputesRepo = disputesRepo;
        this.reviewsRepo = reviewsRepo;
    }
    async getOverview() {
        const [courses, learners, enrollments, transactions, instructors, users] = await Promise.all([
            this.coursesRepo.find(),
            this.learnersRepo.find(),
            this.enrollmentsRepo.find(),
            this.transactionsRepo.find(),
            this.instructorsRepo.find(),
            this.usersRepo.find(),
        ]);
        const grossRevenue = courses.reduce((sum, c) => sum + (c.revenue || (c.price || 0) * (c.enrolledCount || 10)), 0);
        const categoryRevenueMap = {};
        for (const c of courses) {
            const cat = c.category || 'General';
            if (!categoryRevenueMap[cat]) {
                categoryRevenueMap[cat] = { count: 0, revenue: 0, seats: 0 };
            }
            categoryRevenueMap[cat].count += 1;
            categoryRevenueMap[cat].revenue += c.revenue || (c.price || 0) * (c.enrolledCount || 10);
            categoryRevenueMap[cat].seats += c.enrolledCount || 0;
        }
        const categoryBreakdown = Object.entries(categoryRevenueMap).map(([category, stats]) => ({
            category,
            coursesCount: stats.count,
            seatsEnrolled: stats.seats,
            totalRevenue: stats.revenue,
            percentageOfTotal: grossRevenue > 0 ? Math.round((stats.revenue / grossRevenue) * 100) : 0,
        }));
        const monthlyTrend = [
            { name: 'May', learners: 340, revenue: 24800 },
            { name: 'Jun', learners: 410, revenue: 28900 },
            { name: 'Jul', learners: 520, revenue: 35400 },
            { name: 'Aug', learners: 680, revenue: 42580 },
        ];
        const completed = enrollments.filter((e) => e.status === 'Completed' || e.progress === 100).length;
        const active = enrollments.filter((e) => e.status === 'Active' && e.progress < 100).length;
        const dropped = enrollments.filter((e) => e.status === 'Dropped').length;
        const studentCount = users.filter((u) => u.role === 'Student' || u.role === 'Learner').length;
        const instructorCount = users.filter((u) => u.role === 'Instructor').length;
        const orgCount = users.filter((u) => u.role === 'Organization').length;
        const adminCount = users.filter((u) => u.role === 'Admin' || u.role === 'Super Admin').length;
        return {
            stats: {
                totalUsers: users.length.toString(),
                totalLearners: studentCount.toString(),
                totalInstructors: instructorCount.toString(),
                organizations: orgCount.toString(),
                adminsCount: adminCount.toString(),
                courses: courses.length.toString(),
                enrollments: enrollments.length.toString(),
                totalRevenue: `₹${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                pendingApprovals: courses.filter((c) => c.status === 'Pending Approval' || c.status === 'Draft').length.toString(),
            },
            userGrowth: monthlyTrend,
            revenueData: monthlyTrend,
            weeklyActiveUsers: [
                { name: 'Mon', active: 340 },
                { name: 'Tue', active: 460 },
                { name: 'Wed', active: 580 },
                { name: 'Thu', active: 620 },
                { name: 'Fri', active: 750 },
                { name: 'Sat', active: 430 },
                { name: 'Sun', active: 390 },
            ],
            categoryData: categoryBreakdown.map((c) => ({
                name: c.category,
                value: c.coursesCount,
                count: c.coursesCount,
                revenue: c.totalRevenue,
            })),
            kpis: {
                totalRevenue: grossRevenue,
                monthlyRevenue: Math.round(grossRevenue * 0.3),
                totalEnrollments: enrollments.length,
                activeLearners: learners.length,
                completionRate: enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 72,
                retentionRate: 94.2,
            },
            categoryBreakdown,
            monthlyTrend,
            enrollmentStatusDistribution: { completed, active, dropped },
            learnerDemographics: { students: studentCount, professionals: learners.length - studentCount },
            topInstructorsByRevenue: instructors
                .sort((a, b) => (b.revenueGenerated || 0) - (a.revenueGenerated || 0))
                .slice(0, 5)
                .map((inst) => ({
                id: inst.id,
                name: inst.name,
                specialization: inst.specialization,
                revenueGenerated: inst.revenueGenerated || 0,
                avgRating: inst.avgRating || 4.8,
                enrolledStudents: inst.enrolledStudents || 0,
            })),
        };
    }
    async getSuperAdminAnalytics() {
        const [overview, users, orgs, disputes] = await Promise.all([
            this.getOverview(),
            this.usersRepo.find(),
            this.orgRepo.find(),
            this.disputesRepo.find(),
        ]);
        const totalGrossRevenue = overview.kpis?.totalRevenue || 429480;
        const orgShare85 = Math.round(totalGrossRevenue * 0.85);
        const superAdminShare15 = Math.round(totalGrossRevenue * 0.15);
        const escalations = disputes.filter((d) => d.status === 'Escalated' || d.status === 'Under Review' || d.priority === 'Urgent');
        return {
            ...overview,
            systemHealth: {
                status: 'Optimal',
                uptime: '99.98%',
                activeDatabase: 'JSON DB Simulation Engine',
                version: '2.4.0',
                activeCollections: 13,
                persistencePath: './data/*.json',
            },
            revenueSplit: {
                totalGrossRevenue,
                orgShare85,
                superAdminShare15,
                orgPercentage: 85,
                superAdminPercentage: 15,
                formattedGross: `₹${totalGrossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                formattedOrgShare: `₹${orgShare85.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                formattedSuperAdminShare: `₹${superAdminShare15.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            },
            rolesBreakdown: {
                superAdmins: users.filter((u) => u.role === 'Super Admin').length,
                admins: users.filter((u) => u.role === 'Admin').length,
                organizations: orgs.length || users.filter((u) => u.role === 'Organization').length,
                instructors: users.filter((u) => u.role === 'Instructor').length,
                students: users.filter((u) => u.role === 'Student' || u.role === 'Learner').length,
            },
            escalationsSummary: {
                total: escalations.length,
                urgentCount: escalations.filter((e) => e.priority === 'Urgent').length,
                highCount: escalations.filter((e) => e.priority === 'High').length,
                items: escalations.slice(0, 5),
            },
            auditLogs: [
                { id: 'log-1', action: 'Global system backup', user: 'Platform Super Admin', timestamp: '10 mins ago', status: 'Success' },
                { id: 'log-2', action: 'Revenue split settlement finalized (85% Org / 15% Platform)', user: 'Platform Super Admin', timestamp: '35 mins ago', status: 'Success' },
                { id: 'log-3', action: 'New Admin role assigned to operational supervisor', user: 'Platform Super Admin', timestamp: '1 hour ago', status: 'Success' },
                { id: 'log-4', action: 'Organization verification approved for MIT', user: 'Operational Admin', timestamp: '3 hours ago', status: 'Success' },
                { id: 'log-5', action: 'Escalation ticket DSP-2026-068 reviewed', user: 'Platform Super Admin', timestamp: '5 hours ago', status: 'Under Review' },
            ],
        };
    }
    async getInstructorAnalytics() {
        const [courses, enrollments, reviews, transactions] = await Promise.all([
            this.coursesRepo.find(),
            this.enrollmentsRepo.find(),
            this.reviewsRepo.find(),
            this.transactionsRepo.find(),
        ]);
        const totalStudents = enrollments.length;
        const activeLearners = enrollments.filter((e) => e.status === 'Active').length;
        const validReviews = reviews.filter((r) => r.rating != null && !isNaN(Number(r.rating)));
        const avgRating = validReviews.length > 0
            ? parseFloat((validReviews.reduce((sum, r) => sum + Number(r.rating), 0) / validReviews.length).toFixed(1))
            : null;
        const completed = enrollments.filter((e) => e.status === 'Completed' || e.progress === 100).length;
        const completionRate = enrollments.length > 0
            ? `${Math.round((completed / enrollments.length) * 100)}%`
            : '0%';
        const totalEarningsNum = transactions
            .filter((t) => (t.status === 'Paid' || t.status === 'Completed' || t.type === 'enrollment') && Number(t.amount) > 0)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalEarnings = totalEarningsNum > 0
            ? `₹${totalEarningsNum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
            : null;
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        enrollments.forEach((e) => {
            const d = e.enrolledAt || e.createdAt;
            if (d) {
                const dayName = dayNames[new Date(d).getDay()];
                if (dayMap[dayName] !== undefined) {
                    dayMap[dayName] += 1;
                }
            }
        });
        const dashboardEnrollments = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
            name: day,
            count: dayMap[day],
            enrollments: dayMap[day],
            active: Math.round(dayMap[day] * 0.75),
        }));
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthMap = {};
        monthOrder.forEach((m) => {
            monthMap[m] = { enrollments: 0, completions: 0 };
        });
        enrollments.forEach((e) => {
            const dateStr = e.enrolledAt || e.createdAt;
            if (dateStr) {
                const m = new Date(dateStr).toLocaleString('en', { month: 'short' });
                if (monthMap[m]) {
                    monthMap[m].enrollments += 1;
                    if (e.status === 'Completed' || e.progress === 100) {
                        monthMap[m].completions += 1;
                    }
                }
            }
        });
        const currentMonthIdx = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 12) % 12;
            last6Months.push(monthOrder[idx]);
        }
        const enrollmentTrend = last6Months.map((m) => ({
            month: m,
            value: monthMap[m].enrollments,
            enrollments: monthMap[m].enrollments,
            completions: monthMap[m].completions,
        }));
        const coursePerformance = courses.slice(0, 5).map((c) => ({
            name: c.title?.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
            students: c.enrolledCount || 0,
            rating: c.rating != null ? c.rating : null,
            completionRate: c.completionRate || 0,
        }));
        const activities = [];
        enrollments.forEach((e) => {
            const dt = e.enrolledAt || e.createdAt;
            activities.push({
                title: `${e.learnerName || 'Student'} enrolled in '${e.courseTitle || 'Course'}'`,
                timestamp: dt ? new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
                ts: dt ? new Date(dt).getTime() : 0,
            });
        });
        reviews.forEach((r) => {
            const dt = r.createdAt;
            activities.push({
                title: `Review received for '${r.courseTitle || 'Course'}': ${r.rating}★`,
                timestamp: dt ? new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
                ts: dt ? new Date(dt).getTime() : 0,
            });
        });
        activities.sort((a, b) => b.ts - a.ts);
        const recentActivity = activities.slice(0, 6).map(({ title, timestamp }) => ({ title, timestamp }));
        return {
            stats: {
                totalCourses: courses.length,
                totalStudents,
                totalEnrollments: totalStudents.toString(),
                activeLearners: activeLearners.toString(),
                averageRating: avgRating,
                completionRate,
                totalEarnings,
                totalReviews: reviews.length,
            },
            dashboardEnrollments,
            enrollmentTrend,
            coursePerformance,
            engagementData: [],
            recentActivity,
        };
    }
    async getRevenueAnalytics() {
        const transactions = await this.transactionsRepo.find();
        return {
            monthlyRunRate: 42580,
            annualProjection: 142580 * 1.25,
            royaltyPayoutRatio: '70/30',
            payoutLiability: 3200.0,
            transactionsLogged: transactions.length,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.TRANSACTIONS)),
    __param(4, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __param(5, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.USERS)),
    __param(6, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ORGANIZATION)),
    __param(7, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.DISPUTES)),
    __param(8, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.REVIEWS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map