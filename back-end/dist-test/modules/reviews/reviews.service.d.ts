import { JsonRepository } from '../../database/json-repository';
export declare class ReviewsService {
    private readonly reviewsRepo;
    private readonly coursesRepo;
    private readonly learnersRepo;
    private readonly enrollmentsRepo;
    constructor(reviewsRepo: JsonRepository<any>, coursesRepo: JsonRepository<any>, learnersRepo: JsonRepository<any>, enrollmentsRepo: JsonRepository<any>);
    private learnerIdFor;
    findAll(): Promise<any[]>;
    findByCourse(courseId: string): Promise<any[]>;
    create(data: any, userId?: string): Promise<any>;
    update(id: string, data: any, userId?: string): Promise<any>;
    delete(id: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    reply(id: string, responseText: string): Promise<any>;
    deleteReply(id: string): Promise<any>;
    private updateCourseRating;
}
