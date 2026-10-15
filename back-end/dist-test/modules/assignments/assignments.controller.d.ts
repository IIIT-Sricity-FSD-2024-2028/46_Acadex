import { AssignmentsService } from './assignments.service';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByCourse(courseId: string): Promise<any[]>;
    create(body: any): Promise<any>;
    submit(id: string, body: any): Promise<any>;
    grade(id: string, body: {
        score: number;
        feedback: string;
    }): Promise<any>;
}
