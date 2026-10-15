import { JsonRepository } from '../../database/json-repository';
import { CreateLearnerDto, LearnerQueryDto, UpdateLearnerDto } from './dto/learner.dto';
export declare class LearnersService {
    private readonly learnersRepo;
    private readonly enrollmentsRepo;
    constructor(learnersRepo: JsonRepository<any>, enrollmentsRepo: JsonRepository<any>);
    findAll(query: LearnerQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateLearnerDto): Promise<any>;
    update(id: string, dto: UpdateLearnerDto): Promise<any>;
    delete(id: string): Promise<boolean>;
    getLearnerEnrollments(id: string): Promise<any[]>;
}
