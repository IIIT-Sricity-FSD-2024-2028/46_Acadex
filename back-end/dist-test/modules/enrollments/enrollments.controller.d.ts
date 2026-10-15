import { EnrollmentsService } from './enrollments.service';
import { AssignCoursesToLearnersDto, EnrollmentQueryDto, UpdateEnrollmentProgressDto, UpdateEnrollmentStatusDto } from './dto/enrollment.dto';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    findAll(query: EnrollmentQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    assignCourses(dto: AssignCoursesToLearnersDto): Promise<{
        totalAssigned: number;
        enrollments: any[];
        transactions: any[];
    }>;
    updateProgress(id: string, dto: UpdateEnrollmentProgressDto): Promise<any>;
    updateStatus(id: string, dto: UpdateEnrollmentStatusDto): Promise<any>;
    delete(id: string): Promise<boolean>;
}
