import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import { AssignCoursesToLearnersDto, EnrollmentQueryDto, UpdateEnrollmentProgressDto, UpdateEnrollmentStatusDto } from './dto/enrollment.dto';
export declare class EnrollmentsService {
    private readonly enrollmentsRepo;
    private readonly coursesRepo;
    private readonly learnersRepo;
    private readonly transactionsRepo;
    private readonly notifsRepo;
    private readonly certificatesRepo;
    private readonly dbService;
    constructor(enrollmentsRepo: JsonRepository<any>, coursesRepo: JsonRepository<any>, learnersRepo: JsonRepository<any>, transactionsRepo: JsonRepository<any>, notifsRepo: JsonRepository<any>, certificatesRepo: JsonRepository<any>, dbService: JsonDatabaseService);
    findAll(query: EnrollmentQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    createSingle(data: any): Promise<any>;
    assignCoursesToLearners(dto: AssignCoursesToLearnersDto): Promise<{
        totalAssigned: number;
        enrollments: any[];
        transactions: any[];
    }>;
    updateProgress(id: string, dto: UpdateEnrollmentProgressDto): Promise<any>;
    updateStatus(id: string, dto: UpdateEnrollmentStatusDto): Promise<any>;
    delete(id: string): Promise<boolean>;
}
