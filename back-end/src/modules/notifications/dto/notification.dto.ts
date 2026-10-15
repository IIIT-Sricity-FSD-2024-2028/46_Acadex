import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @ApiProperty({ example: 'New Course Published' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Course has been verified and published to catalog.' })
  @IsNotEmpty()
  @IsString()
  desc: string;

  @ApiPropertyOptional({ example: 'Course' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'blue' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'inst-1791912292835' })
  @IsOptional()
  @IsString()
  recipientId?: string;

  @ApiPropertyOptional({ example: 'instructor' })
  @IsOptional()
  @IsString()
  recipientRole?: string;

  @ApiPropertyOptional({ example: 'cou-fb5ac543' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ example: '/instructor/reviews' })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}

export class NotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter only unread notifications' })
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category (e.g. Instructor, Course, Financial, Dispute, Review)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by recipient ID' })
  @IsOptional()
  @IsString()
  recipientId?: string;

  @ApiPropertyOptional({ description: 'Filter by recipient role (e.g. instructor, student, org, admin)' })
  @IsOptional()
  @IsString()
  role?: string;
}
