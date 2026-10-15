import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare enum EnrollmentStatus {
    ACTIVE = "Active",
    COMPLETED = "Completed",
    DROPPED = "Dropped"
}
export declare class AssignCoursesToLearnersDto {
    courseIds: string[];
    learnerIds: string[];
}
export declare class UpdateEnrollmentProgressDto {
    progress: number;
}
export declare class UpdateEnrollmentStatusDto {
    status: EnrollmentStatus;
}
export declare class EnrollmentQueryDto extends PaginationQueryDto {
    learnerId?: string;
    courseId?: string;
    status?: string;
}
