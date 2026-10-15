import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizDto, CreateQuizQuestionDto } from './dto/quizzes.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByCourse(courseId: string): Promise<any>;
    create(dto: CreateQuizDto): Promise<any>;
    update(id: string, body: any): Promise<any>;
    addQuestion(dto: CreateQuizQuestionDto): Promise<any>;
    submit(id: string, dto: SubmitQuizDto, userId?: string): Promise<{
        quizId: string;
        score: number;
        correctCount: number;
        totalQuestions: any;
        passed: boolean;
        feedback: any[];
        certificateIssued: boolean;
    }>;
}
