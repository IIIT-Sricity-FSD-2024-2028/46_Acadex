import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare class CourseModuleDto {
    id?: string;
    title: string;
    lessons?: number;
    duration?: string;
}
export declare class CourseInstructorAssignmentDto {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    specialization?: string;
}
export declare class CreateCourseDto {
    title: string;
    category?: string;
    level?: string;
    instructorId?: string;
    coInstructorIds?: string[];
    instructors?: CourseInstructorAssignmentDto[];
    price?: number;
    status?: string;
    thumbnail?: string;
    description?: string;
    modules?: CourseModuleDto[];
}
export declare class UpdateCourseDto {
    title?: string;
    category?: string;
    level?: string;
    instructorId?: string;
    coInstructorIds?: string[];
    instructors?: CourseInstructorAssignmentDto[];
    price?: number;
    status?: string;
    thumbnail?: string;
    description?: string;
    modules?: CourseModuleDto[];
    rating?: number;
    enrolledCount?: number;
    revenue?: number;
}
export declare class CourseQueryDto extends PaginationQueryDto {
    category?: string;
    level?: string;
    status?: string;
    instructorId?: string;
    organizationId?: string;
}
