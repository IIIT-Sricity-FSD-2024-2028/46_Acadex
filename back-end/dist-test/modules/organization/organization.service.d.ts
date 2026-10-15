import { JsonRepository } from '../../database/json-repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationService {
    private readonly orgRepo;
    private readonly instructorsRepo;
    private readonly learnersRepo;
    private readonly coursesRepo;
    private readonly enrollmentsRepo;
    private readonly requestsRepo;
    private readonly notifsRepo;
    constructor(orgRepo: JsonRepository<any>, instructorsRepo: JsonRepository<any>, learnersRepo: JsonRepository<any>, coursesRepo: JsonRepository<any>, enrollmentsRepo: JsonRepository<any>, requestsRepo: JsonRepository<any>, notifsRepo: JsonRepository<any>);
    private resolveOrg;
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
    findAllOrgs(): Promise<any[]>;
    findOrgById(id: string): Promise<any>;
    createOrg(dto: any): Promise<any>;
    updateOrg(id: string, dto: any): Promise<any>;
    deleteOrg(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getStudentJoinRequests(userId?: string, userEmail?: string): Promise<any[]>;
    respondStudentJoinRequest(learnerId: string, action: 'approve' | 'reject', userId?: string, userEmail?: string): Promise<any>;
}
