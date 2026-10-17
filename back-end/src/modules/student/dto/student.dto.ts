import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class StudentCheckoutDto {
  @ApiProperty({ example: 'crs-1' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ enum: ['card', 'upi'] })
  @IsIn(['card', 'upi'])
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'name@okaxis' })
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiPropertyOptional({ example: '4242' })
  @IsOptional()
  @IsString()
  cardLast4?: string;
}

export class StudentEnrollDto {
  @ApiProperty({ example: 'crs-1' })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}

export class UpdateProgressDto {
  @ApiProperty({ example: 'mod-1-l1' })
  @IsString()
  lessonId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  completed: boolean;
}
