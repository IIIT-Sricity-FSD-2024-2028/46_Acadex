import { JsonRepository } from '../../database/json-repository';
export declare class AssignmentsService {
    private readonly assignmentsRepo;
    private readonly submissionsRepo;
    constructor(assignmentsRepo: JsonRepository<any>, submissionsRepo: JsonRepository<any>);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByCourse(courseId: string): Promise<any[]>;
    create(data: any): Promise<any>;
    submit(assignmentId: string, data: any): Promise<any>;
    gradeSubmission(submissionId: string, score: number, feedback: string): Promise<any>;
}
