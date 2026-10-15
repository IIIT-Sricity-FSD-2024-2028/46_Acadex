import { JsonRepository } from '../../database/json-repository';
import { CreateInstructorDto, InstructorQueryDto, UpdateInstructorDto } from './dto/instructor.dto';
export declare class InstructorsService {
    private readonly instructorsRepo;
    private readonly coursesRepo;
    private readonly orgsRepo;
    private readonly usersRepo;
    constructor(instructorsRepo: JsonRepository<any>, coursesRepo: JsonRepository<any>, orgsRepo: JsonRepository<any>, usersRepo: JsonRepository<any>);
    findAll(query: InstructorQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateInstructorDto): Promise<any>;
    update(id: string, dto: UpdateInstructorDto): Promise<any>;
    delete(id: string): Promise<boolean>;
    getInstructorCourses(id: string): Promise<any[]>;
    leaveOrganization(id: string, userId?: string): Promise<any>;
}
