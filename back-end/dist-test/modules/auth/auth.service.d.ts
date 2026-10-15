import { JsonRepository } from '../../database/json-repository';
import { UserEntity } from '../../database/schema';
import { LoginDto, RegisterDto, ChangePasswordDto, PasswordResetConfirmDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly usersRepo;
    private readonly learnersRepo;
    private readonly instructorsRepo;
    private readonly passwordResetCodes;
    constructor(usersRepo: JsonRepository<UserEntity>, learnersRepo: JsonRepository<any>, instructorsRepo: JsonRepository<any>);
    private meetsPasswordCriteria;
    private ensurePasswordCriteria;
    private normalizeRole;
    private rolesMatch;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: string;
            avatar: any;
            university: any;
            instructorId?: undefined;
            organizationId?: undefined;
            organizationName?: undefined;
            status?: undefined;
            verificationStatus?: undefined;
        };
    } | {
        token: string;
        user: {
            id: any;
            instructorId: any;
            name: any;
            email: any;
            role: string;
            avatar: any;
            organizationId: any;
            organizationName: any;
            status: any;
            university?: undefined;
            verificationStatus?: undefined;
        };
    } | {
        token: string;
        user: {
            id: string;
            instructorId: any;
            name: string;
            email: string;
            role: "Instructor" | "Student" | "Organization" | "Admin" | "Learner" | "Educator" | "SuperAdmin" | "Super Admin";
            avatar: string;
            verificationStatus: "Verified" | "Pending" | "Rejected";
            organizationId: string;
            organizationName: string;
            status: "Active" | "Inactive" | "Suspended" | "Pending" | "Pending Affiliation";
            university?: undefined;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            instructorId: string;
            organizationId: any;
            organizationName: any;
            status: string;
            id: string;
            name: string;
            email: string;
            password?: string;
            role: "Student" | "Learner" | "Instructor" | "Educator" | "Organization" | "Admin" | "SuperAdmin" | "Super Admin";
            avatar?: string;
            verificationStatus?: "Verified" | "Pending" | "Rejected";
            createdAt?: string;
            updatedAt?: string;
            lastLogin?: string;
        };
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    confirmPasswordReset(dto: PasswordResetConfirmDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(userId: string): Promise<any>;
}
