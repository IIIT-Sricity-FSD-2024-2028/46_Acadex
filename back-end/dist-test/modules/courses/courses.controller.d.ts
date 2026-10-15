import { CoursesService } from './courses.service';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAll(query: CourseQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateCourseDto): Promise<any>;
    updateFull(id: string, dto: UpdateCourseDto): Promise<any>;
    updatePartial(id: string, dto: UpdateCourseDto): Promise<any>;
    delete(id: string): Promise<boolean>;
    uploadFile(id: string, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            courseId: string;
            filename: string;
            original: string;
            size: number;
            path: string;
        };
    }>;
}
