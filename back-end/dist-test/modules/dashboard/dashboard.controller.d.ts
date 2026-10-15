import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(): Promise<{
        organization: any;
        kpis: {
            totalInstructors: number;
            totalLearners: number;
            activeCourses: number;
            totalEnrollments: number;
            annualRevenue: any;
            monthlyRevenue: number;
            pendingRequestsCount: number;
            averageRating: any;
            completionRate: any;
        };
        recentEnrollments: any[];
        recentTransactions: any[];
        pendingInvitations: any[];
        recentNotifications: any[];
        topPerformingCourses: {
            id: any;
            title: any;
            category: any;
            enrolledCount: any;
            rating: any;
            revenue: any;
            status: any;
        }[];
    }>;
    getRecentActivity(): Promise<{
        enrollments: any[];
        transactions: any[];
        notifications: any[];
        requests: any[];
    }>;
}
