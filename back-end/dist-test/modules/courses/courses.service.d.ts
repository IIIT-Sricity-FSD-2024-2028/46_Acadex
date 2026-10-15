import { JsonRepository } from '../../database/json-repository';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class CoursesService {
    private readonly coursesRepo;
    private readonly instructorsRepo;
    private readonly enrollmentsRepo;
    constructor(coursesRepo: JsonRepository<any>, instructorsRepo: JsonRepository<any>, enrollmentsRepo: JsonRepository<any>);
    findAll(query: CourseQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateCourseDto): Promise<any>;
    update(id: string, dto: UpdateCourseDto): Promise<any>;
    delete(id: string): Promise<boolean>;
    private resolveInstructors;
}
