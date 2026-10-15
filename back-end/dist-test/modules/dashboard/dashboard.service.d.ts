import { JsonRepository } from '../../database/json-repository';
export declare class DashboardService {
    private readonly orgRepo;
    private readonly instructorsRepo;
    private readonly learnersRepo;
    private readonly coursesRepo;
    private readonly enrollmentsRepo;
    private readonly transactionsRepo;
    private readonly requestsRepo;
    private readonly notifsRepo;
    constructor(orgRepo: JsonRepository<any>, instructorsRepo: JsonRepository<any>, learnersRepo: JsonRepository<any>, coursesRepo: JsonRepository<any>, enrollmentsRepo: JsonRepository<any>, transactionsRepo: JsonRepository<any>, requestsRepo: JsonRepository<any>, notifsRepo: JsonRepository<any>);
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
