import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getRootOverview(): Promise<{
        stats: {
            totalUsers: string;
            totalLearners: string;
            totalInstructors: string;
            organizations: string;
            adminsCount: string;
            courses: string;
            enrollments: string;
            totalRevenue: string;
            pendingApprovals: string;
        };
        userGrowth: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        revenueData: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        weeklyActiveUsers: {
            name: string;
            active: number;
        }[];
        categoryData: {
            name: string;
            value: number;
            count: number;
            revenue: number;
        }[];
        kpis: {
            totalRevenue: any;
            monthlyRevenue: number;
            totalEnrollments: number;
            activeLearners: number;
            completionRate: number;
            retentionRate: number;
        };
        categoryBreakdown: {
            category: string;
            coursesCount: number;
            seatsEnrolled: number;
            totalRevenue: number;
            percentageOfTotal: number;
        }[];
        monthlyTrend: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        enrollmentStatusDistribution: {
            completed: number;
            active: number;
            dropped: number;
        };
        learnerDemographics: {
            students: number;
            professionals: number;
        };
        topInstructorsByRevenue: {
            id: any;
            name: any;
            specialization: any;
            revenueGenerated: any;
            avgRating: any;
            enrolledStudents: any;
        }[];
    }>;
    getOverview(): Promise<{
        stats: {
            totalUsers: string;
            totalLearners: string;
            totalInstructors: string;
            organizations: string;
            adminsCount: string;
            courses: string;
            enrollments: string;
            totalRevenue: string;
            pendingApprovals: string;
        };
        userGrowth: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        revenueData: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        weeklyActiveUsers: {
            name: string;
            active: number;
        }[];
        categoryData: {
            name: string;
            value: number;
            count: number;
            revenue: number;
        }[];
        kpis: {
            totalRevenue: any;
            monthlyRevenue: number;
            totalEnrollments: number;
            activeLearners: number;
            completionRate: number;
            retentionRate: number;
        };
        categoryBreakdown: {
            category: string;
            coursesCount: number;
            seatsEnrolled: number;
            totalRevenue: number;
            percentageOfTotal: number;
        }[];
        monthlyTrend: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        enrollmentStatusDistribution: {
            completed: number;
            active: number;
            dropped: number;
        };
        learnerDemographics: {
            students: number;
            professionals: number;
        };
        topInstructorsByRevenue: {
            id: any;
            name: any;
            specialization: any;
            revenueGenerated: any;
            avgRating: any;
            enrolledStudents: any;
        }[];
    }>;
    getSuperAdmin(): Promise<{
        systemHealth: {
            status: string;
            uptime: string;
            activeDatabase: string;
            version: string;
            activeCollections: number;
            persistencePath: string;
        };
        revenueSplit: {
            totalGrossRevenue: any;
            orgShare85: number;
            superAdminShare15: number;
            orgPercentage: number;
            superAdminPercentage: number;
            formattedGross: string;
            formattedOrgShare: string;
            formattedSuperAdminShare: string;
        };
        rolesBreakdown: {
            superAdmins: number;
            admins: number;
            organizations: number;
            instructors: number;
            students: number;
        };
        escalationsSummary: {
            total: number;
            urgentCount: number;
            highCount: number;
            items: any[];
        };
        auditLogs: {
            id: string;
            action: string;
            user: string;
            timestamp: string;
            status: string;
        }[];
        stats: {
            totalUsers: string;
            totalLearners: string;
            totalInstructors: string;
            organizations: string;
            adminsCount: string;
            courses: string;
            enrollments: string;
            totalRevenue: string;
            pendingApprovals: string;
        };
        userGrowth: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        revenueData: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        weeklyActiveUsers: {
            name: string;
            active: number;
        }[];
        categoryData: {
            name: string;
            value: number;
            count: number;
            revenue: number;
        }[];
        kpis: {
            totalRevenue: any;
            monthlyRevenue: number;
            totalEnrollments: number;
            activeLearners: number;
            completionRate: number;
            retentionRate: number;
        };
        categoryBreakdown: {
            category: string;
            coursesCount: number;
            seatsEnrolled: number;
            totalRevenue: number;
            percentageOfTotal: number;
        }[];
        monthlyTrend: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        enrollmentStatusDistribution: {
            completed: number;
            active: number;
            dropped: number;
        };
        learnerDemographics: {
            students: number;
            professionals: number;
        };
        topInstructorsByRevenue: {
            id: any;
            name: any;
            specialization: any;
            revenueGenerated: any;
            avgRating: any;
            enrolledStudents: any;
        }[];
    }>;
    getInstructor(): Promise<{
        stats: {
            totalCourses: number;
            totalStudents: number;
            totalEnrollments: string;
            activeLearners: string;
            averageRating: number;
            completionRate: string;
            totalEarnings: string;
            totalReviews: number;
        };
        dashboardEnrollments: {
            name: string;
            count: number;
            enrollments: number;
            active: number;
        }[];
        enrollmentTrend: {
            month: string;
            value: number;
            enrollments: number;
            completions: number;
        }[];
        coursePerformance: {
            name: any;
            students: any;
            rating: any;
            completionRate: any;
        }[];
        engagementData: any[];
        recentActivity: {
            title: string;
            timestamp: string;
        }[];
    }>;
    getOrganization(): Promise<{
        stats: {
            totalUsers: string;
            totalLearners: string;
            totalInstructors: string;
            organizations: string;
            adminsCount: string;
            courses: string;
            enrollments: string;
            totalRevenue: string;
            pendingApprovals: string;
        };
        userGrowth: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        revenueData: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        weeklyActiveUsers: {
            name: string;
            active: number;
        }[];
        categoryData: {
            name: string;
            value: number;
            count: number;
            revenue: number;
        }[];
        kpis: {
            totalRevenue: any;
            monthlyRevenue: number;
            totalEnrollments: number;
            activeLearners: number;
            completionRate: number;
            retentionRate: number;
        };
        categoryBreakdown: {
            category: string;
            coursesCount: number;
            seatsEnrolled: number;
            totalRevenue: number;
            percentageOfTotal: number;
        }[];
        monthlyTrend: {
            name: string;
            learners: number;
            revenue: number;
        }[];
        enrollmentStatusDistribution: {
            completed: number;
            active: number;
            dropped: number;
        };
        learnerDemographics: {
            students: number;
            professionals: number;
        };
        topInstructorsByRevenue: {
            id: any;
            name: any;
            specialization: any;
            revenueGenerated: any;
            avgRating: any;
            enrolledStudents: any;
        }[];
    }>;
    getRevenue(): Promise<{
        monthlyRunRate: number;
        annualProjection: number;
        royaltyPayoutRatio: string;
        payoutLiability: number;
        transactionsLogged: number;
    }>;
}
