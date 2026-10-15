export declare class LoginDto {
    email: string;
    password: string;
    role?: string;
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role: 'Student' | 'Instructor' | 'Organization' | 'Admin' | 'SuperAdmin';
    university?: string;
    expertise?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class PasswordResetRequestDto {
    email: string;
}
export declare class PasswordResetConfirmDto {
    email: string;
    code: string;
    newPassword: string;
}
