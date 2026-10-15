import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare enum DisputePriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    URGENT = "Urgent"
}
export declare enum DisputeStatus {
    OPEN = "Open",
    UNDER_REVIEW = "Under Review",
    ESCALATED = "Escalated",
    RESOLVED = "Resolved"
}
export declare enum DisputeRole {
    ORGANIZATION = "Organization",
    EDUCATOR = "Educator",
    LEARNER = "Learner"
}
export declare class CreateDisputeDto {
    raisedBy: string;
    raisedById?: string;
    raisedByRole?: DisputeRole;
    disputeType: string;
    subject: string;
    description: string;
    courseTitle?: string;
    courseId?: string;
    priority?: DisputePriority;
    desiredResolution?: string;
}
export declare class UpdateDisputeStatusDto {
    status: DisputeStatus;
    adminNote?: string;
}
export declare class ResolveDisputeDto {
    resolutionNote: string;
}
export declare class DisputeQueryDto extends PaginationQueryDto {
    status?: DisputeStatus;
    priority?: DisputePriority;
}
