import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare enum TeachingRequestDecision {
    ACCEPTED = "Accepted",
    DECLINED = "Declined"
}
export declare class CreateTeachingRequestDto {
    instructorId: string;
    courseId?: string;
    courseTitle?: string;
    semester?: string;
    creditHours?: string;
    proposedTerms?: string;
    message?: string;
    organizationId?: string;
    organizationName?: string;
}
export declare class RespondTeachingRequestDto {
    decision: TeachingRequestDecision;
    notes?: string;
}
export declare class WithdrawTeachingRequestDto {
    reason?: string;
}
export declare class InstructorRequestQueryDto extends PaginationQueryDto {
    status?: string;
    instructorId?: string;
    email?: string;
    organizationId?: string;
    type?: 'invitation' | 'join';
}
export declare class CreateJoinRequestDto {
    organizationId: string;
    message?: string;
}
export declare class DecideJoinRequestDto {
    action: 'approve' | 'reject';
    notes?: string;
}
