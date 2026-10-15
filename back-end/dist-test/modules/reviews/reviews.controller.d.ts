import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAll(): Promise<any[]>;
    findByCourse(courseId: string): Promise<any[]>;
    create(body: any, userId: string): Promise<any>;
    update(id: string, body: any, userId: string): Promise<any>;
    delete(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    reply(id: string, body: {
        response: string;
    }): Promise<any>;
    deleteReply(id: string): Promise<any>;
}
