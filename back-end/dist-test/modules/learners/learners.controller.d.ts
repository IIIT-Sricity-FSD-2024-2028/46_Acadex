import { LearnersService } from './learners.service';
import { CreateLearnerDto, LearnerQueryDto, UpdateLearnerDto } from './dto/learner.dto';
export declare class LearnersController {
    private readonly learnersService;
    constructor(learnersService: LearnersService);
    findAll(query: LearnerQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateLearnerDto): Promise<any>;
    update(id: string, dto: UpdateLearnerDto): Promise<any>;
    delete(id: string): Promise<boolean>;
    getEnrollments(id: string): Promise<any[]>;
}
