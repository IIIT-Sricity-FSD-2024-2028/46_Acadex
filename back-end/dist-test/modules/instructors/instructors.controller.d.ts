import { InstructorsService } from './instructors.service';
import { CreateInstructorDto, InstructorQueryDto, UpdateInstructorDto } from './dto/instructor.dto';
export declare class InstructorsController {
    private readonly instructorsService;
    constructor(instructorsService: InstructorsService);
    findAll(query: InstructorQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateInstructorDto): Promise<any>;
    update(id: string, dto: UpdateInstructorDto): Promise<any>;
    delete(id: string): Promise<boolean>;
    getCourses(id: string): Promise<any[]>;
    leaveOrganization(id: string, userId: string): Promise<any>;
}
