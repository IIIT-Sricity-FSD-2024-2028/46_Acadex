import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare class CreateLearnerDto {
    name: string;
    email: string;
    avatar?: string;
    learnerType?: string;
    university?: string;
    status?: string;
    joinedDate?: string;
}
export declare class UpdateLearnerDto {
    name?: string;
    email?: string;
    avatar?: string;
    learnerType?: string;
    university?: string;
    enrolledCourses?: number;
    completedCourses?: number;
    overallProgress?: number;
    avgScore?: string;
    certificatesCount?: number;
    status?: string;
    totalSpent?: number;
}
export declare class LearnerQueryDto extends PaginationQueryDto {
    learnerType?: string;
    status?: string;
}
