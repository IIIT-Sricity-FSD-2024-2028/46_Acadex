import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    getProfile(userId?: string, userEmail?: string): Promise<any>;
    updateProfile(dto: UpdateOrganizationDto, userId?: string, userEmail?: string): Promise<any>;
    getStats(userId?: string, userEmail?: string): Promise<{
        totalInstructors: number;
        totalLearners: number;
        activeCourses: number;
        totalCourses: number;
        totalEnrollments: number;
        activeEnrollments: number;
        completedEnrollments: number;
        pendingRequests: number;
        unreadNotifications: number;
        annualRevenue: any;
        monthlyRevenue: number;
        completionRate: number;
        averageRating: number;
        currency: string;
    }>;
    getStudentJoinRequests(userId?: string, userEmail?: string): Promise<any[]>;
    respondStudentJoinRequest(learnerId: string, body: {
        action: 'approve' | 'reject';
    }, userId?: string, userEmail?: string): Promise<any>;
}
