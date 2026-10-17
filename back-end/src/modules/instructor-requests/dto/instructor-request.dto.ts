import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum TeachingRequestDecision {
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
}

export class CreateTeachingRequestDto {
  @ApiProperty({ example: 'inst-1' })
  @IsNotEmpty()
  @IsString()
  instructorId: string;

  @ApiPropertyOptional({ example: 'crs-1' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ example: 'AWS Solutions Architect Masterclass' })
  @IsOptional()
  @IsString()
  courseTitle?: string;

  @ApiPropertyOptional({ example: 'Fall 2026' })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiPropertyOptional({ example: '4 Academic Credits' })
  @IsOptional()
  @IsString()
  creditHours?: string;

  @ApiPropertyOptional({ example: '70/30 faculty course royalty + $10,000 research grant' })
  @IsOptional()
  @IsString()
  proposedTerms?: string;

  @ApiPropertyOptional({ example: 'Organization formal invitation for faculty teaching appointment' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'org-101' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: 'Meridian Tech Institute' })
  @IsOptional()
  @IsString()
  organizationName?: string;
}

export class RespondTeachingRequestDto {
  @ApiProperty({ enum: TeachingRequestDecision, example: TeachingRequestDecision.ACCEPTED })
  @IsNotEmpty()
  @IsEnum(TeachingRequestDecision)
  decision: TeachingRequestDecision;

  @ApiPropertyOptional({ example: 'Professor accepted the assignment terms for Fall 2026.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class WithdrawTeachingRequestDto {
  @ApiPropertyOptional({ example: 'Position fulfilled internally or canceled.' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class InstructorRequestQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by request status (e.g. Pending, Accepted, Declined)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by instructor ID' })
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiPropertyOptional({ description: 'Filter by instructor email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ enum: ['invitation', 'join'] })
  @IsOptional()
  @IsIn(['invitation', 'join'])
  type?: 'invitation' | 'join';
}

export class CreateJoinRequestDto {
  @ApiProperty({ example: 'org-1' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiPropertyOptional({ example: 'I teach backend engineering and would like to join your faculty.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class DecideJoinRequestDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
