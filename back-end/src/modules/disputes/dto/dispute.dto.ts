import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum DisputePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
  CRITICAL = 'Critical',
}

export enum DisputeStatus {
  OPEN = 'Open',
  PENDING = 'Pending',
  UNDER_REVIEW = 'Under Review',
  IN_PROGRESS = 'In Progress',
  ESCALATED = 'Escalated',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected',
}

export enum DisputeRole {
  ORGANIZATION = 'Organization',
  EDUCATOR = 'Educator',
  INSTRUCTOR = 'Instructor',
  LEARNER = 'Learner',
  STUDENT = 'Student',
  ADMIN = 'Admin',
}

export class CreateDisputeDto {
  @ApiProperty({ example: 'Arjun Sharma' })
  @IsNotEmpty()
  @IsString()
  raisedBy: string;

  @ApiPropertyOptional({ example: 'usr-5' })
  @IsOptional()
  @IsString()
  raisedById?: string;

  @ApiPropertyOptional({ example: 'lrn-1' })
  @IsOptional()
  @IsString()
  learnerId?: string;

  @ApiPropertyOptional({ example: 'lrn-1' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({ example: 'usr-5' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: DisputeRole, example: DisputeRole.STUDENT })
  @IsOptional()
  @IsEnum(DisputeRole)
  raisedByRole?: DisputeRole;

  @ApiPropertyOptional({ example: 'Course Content' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Course Content' })
  @IsOptional()
  @IsString()
  disputeType?: string;

  @ApiPropertyOptional({ example: 'Lesson player issue' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Lesson 3.2 video player freezing' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Video stops playing at 04:12 with continuous buffer error.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Object Oriented Programming' })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional({ example: 'Object Oriented Programming' })
  @IsOptional()
  @IsString()
  courseTitle?: string;

  @ApiPropertyOptional({ example: 'cou-fb5ac543' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ example: 'org-1' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: 'Meridian Tech Institute' })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiPropertyOptional({ enum: DisputePriority, example: DisputePriority.MEDIUM })
  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;

  @ApiPropertyOptional({ example: 'Re-encode video or issue lesson credit' })
  @IsOptional()
  @IsString()
  desiredResolution?: string;
}

export class UpdateDisputeStatusDto {
  @ApiProperty({ enum: DisputeStatus, example: DisputeStatus.UNDER_REVIEW })
  @IsNotEmpty()
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @ApiPropertyOptional({ example: 'Dispute assigned to Senior Governance Council.' })
  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class ResolveDisputeDto {
  @ApiProperty({ example: 'Credit adjustment approved and processed via finance settlement ledger.' })
  @IsNotEmpty()
  @IsString()
  resolutionNote: string;
}

export class DisputeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DisputeStatus, description: 'Filter by dispute status' })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiPropertyOptional({ enum: DisputePriority, description: 'Filter by priority level' })
  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;
}
