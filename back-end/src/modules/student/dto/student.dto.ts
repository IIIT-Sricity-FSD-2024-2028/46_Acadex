import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ example: 'Alex Johnson' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'alex.johnson@stanford.edu' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Stanford University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: 'Undergraduate' })
  @IsOptional()
  @IsString()
  learnerType?: string;
}

export class StudentCheckoutDto {
  @ApiProperty({ example: 'crs-101' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 'Credit Card (Stripe)' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 189.00 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseTitle?: string;
}

export class StudentEnrollDto {
  @ApiProperty({ example: 'crs-101' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseTitle?: string;
}

export class UpdateProgressDto {
  @ApiProperty({ example: 'les-101' })
  @IsString()
  lessonId: string;

  @ApiProperty({ example: true })
  completed: boolean;
}
