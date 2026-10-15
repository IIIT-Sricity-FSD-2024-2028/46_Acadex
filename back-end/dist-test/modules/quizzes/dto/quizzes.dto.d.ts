export declare class CreateQuizDto {
    courseId: string;
    title: string;
    description?: string;
    durationMinutes?: number;
    passingScore?: number;
}
export declare class SubmitQuizDto {
    answers: Record<string, string>;
}
export declare class CreateQuizQuestionDto {
    quizId: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: 'A' | 'B' | 'C' | 'D';
    explanation?: string;
}
