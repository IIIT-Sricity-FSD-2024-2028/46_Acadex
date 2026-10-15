export declare class CreateUserDto {
    name: string;
    email: string;
    role: string;
    status?: string;
    verificationStatus?: string;
    institution?: string;
    expertise?: string;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    verificationStatus?: string;
    institution?: string;
    expertise?: string;
}
