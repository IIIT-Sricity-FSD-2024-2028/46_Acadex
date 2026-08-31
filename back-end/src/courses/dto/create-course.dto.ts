import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'The title of the course', example: 'Introduction to Programming' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Subtitle of the course' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Description of the course' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'The name of the instructor', example: 'Dr. Sarah Jenkins' })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiPropertyOptional({ description: 'The organization', example: 'University of Tech' })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({ description: 'The category', example: 'Computer Science' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'The level of the course', example: 'Advanced' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'The price of the course', example: 49.99 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Number of students', example: 1250 })
  @IsOptional()
  @IsNumber()
  students?: number;

  @ApiPropertyOptional({ description: 'Rating', example: 4.8 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: 'The status', example: 'Published' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Thumbnail image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Learning objectives' })
  @IsOptional()
  objectives?: string[] | string;

  @ApiPropertyOptional({ description: 'Prerequisites' })
  @IsOptional()
  @IsString()
  prerequisites?: string;

  @ApiPropertyOptional({ description: 'Modules and curriculum' })
  @IsOptional()
  modules?: any[];

  @ApiPropertyOptional({ description: 'Visibility' })
  @IsOptional()
  visibility?: boolean;

  @ApiPropertyOptional({ description: 'Certificate' })
  @IsOptional()
  certificate?: boolean;

  @ApiPropertyOptional({ description: 'Created date', example: '2023-05-10' })
  @IsOptional()
  @IsString()
  createdDate?: string;
}
