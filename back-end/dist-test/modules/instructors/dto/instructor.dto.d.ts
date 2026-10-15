import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare class CreateInstructorDto {
    name: string;
    email: string;
    avatar?: string;
    educatorType?: string;
    specialization: string;
    expertise?: string[];
    bio?: string;
    status?: string;
    avgRating?: number;
    joinedDate?: string;
}
export declare class UpdateInstructorDto {
    phone?: string;
    location?: string;
    website?: string;
    qualification?: string;
    experience?: string;
    department?: string;
    name?: string;
    email?: string;
    avatar?: string;
    educatorType?: string;
    specialization?: string;
    expertise?: string[];
    bio?: string;
    status?: string;
    coursesCount?: number;
    enrolledStudents?: number;
    avgRating?: number;
    revenueGenerated?: number;
    joinedDate?: string;
}
export declare class InstructorQueryDto extends PaginationQueryDto {
    specialization?: string;
    status?: string;
}
