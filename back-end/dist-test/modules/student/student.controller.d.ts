import { StudentService } from './student.service';
import { UpdateStudentProfileDto, StudentCheckoutDto, StudentEnrollDto, UpdateProgressDto } from './dto/student.dto';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    getProfile(userId: string): Promise<any>;
    updateProfile(dto: UpdateStudentProfileDto, userId: string): Promise<any>;
    getOrganizations(): Promise<any[]>;
    requestJoinOrganization(body: {
        organizationId: string;
        organizationName: string;
    }, userId: string): Promise<any>;
    getCatalog(): Promise<any[]>;
    getCatalogCourse(courseId: string): Promise<any>;
    getEnrollments(userId: string): Promise<any[]>;
    getEnrollmentForCourse(courseId: string, userId: string): Promise<any>;
    enroll(dto: StudentEnrollDto, userId: string): Promise<any>;
    updateProgress(enrollmentId: string, dto: UpdateProgressDto, userId: string): Promise<any>;
    getCertificates(userId: string): Promise<any[]>;
    getPayments(userId: string): Promise<any[]>;
    checkout(dto: StudentCheckoutDto, userId: string): Promise<{
        success: boolean;
        transactionId: any;
        enrollmentId: any;
        courseId: any;
        courseTitle: any;
        amount: any;
        method: string;
        date: string;
    }>;
}
