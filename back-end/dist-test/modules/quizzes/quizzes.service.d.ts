import { JsonRepository } from '../../database/json-repository';
import { CreateQuizDto, SubmitQuizDto, CreateQuizQuestionDto } from './dto/quizzes.dto';
export declare class QuizzesService {
    private readonly quizzesRepo;
    private readonly questionsRepo;
    private readonly certificatesRepo;
    private readonly learnersRepo;
    constructor(quizzesRepo: JsonRepository<any>, questionsRepo: JsonRepository<any>, certificatesRepo: JsonRepository<any>, learnersRepo: JsonRepository<any>);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByCourse(courseId: string): Promise<any>;
    create(dto: CreateQuizDto): Promise<any>;
    update(id: string, data: any): Promise<any>;
    addQuestion(dto: CreateQuizQuestionDto): Promise<any>;
    submitQuiz(quizId: string, dto: SubmitQuizDto, userId?: string): Promise<{
        quizId: string;
        score: number;
        correctCount: number;
        totalQuestions: any;
        passed: boolean;
        feedback: any[];
        certificateIssued: boolean;
    }>;
}
