export declare class UpdateStudentProfileDto {
    name?: string;
    title?: string;
    location?: string;
    bio?: string;
    phone?: string;
}
export declare class StudentCheckoutDto {
    courseId: string;
    paymentMethod: string;
    upiId?: string;
    cardLast4?: string;
}
export declare class StudentEnrollDto {
    courseId: string;
}
export declare class UpdateProgressDto {
    lessonId: string;
    completed: boolean;
}
