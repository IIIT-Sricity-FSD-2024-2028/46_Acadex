import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, PasswordResetConfirmDto, PasswordResetRequestDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    requestPasswordReset(dto: PasswordResetRequestDto): Promise<{
        message: string;
    }>;
    confirmPasswordReset(dto: PasswordResetConfirmDto): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(dto: ChangePasswordDto, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(userId?: string): Promise<any>;
}
