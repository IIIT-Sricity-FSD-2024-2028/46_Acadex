import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstructorDto {
  @ApiProperty({ description: 'The name of the instructor', example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The email of the instructor', example: 'instructor@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'The expertise of the instructor', example: 'Machine Learning' })
  @IsOptional()
  @IsString()
  expertise?: string;

  @ApiPropertyOptional({ description: 'The qualification of the instructor', example: 'Ph.D. in AI' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({ description: 'The organization of the instructor', example: 'Tech Academy' })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({ description: 'The verification status', example: 'Verified' })
  @IsOptional()
  @IsString()
  verificationStatus?: string;

  @ApiPropertyOptional({ description: 'The status', example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Number of courses', example: 5 })
  @IsOptional()
  courses?: number;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Personal website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Instructor bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Organization department' })
  @IsOptional()
  @IsString()
  orgDepartment?: string;

  @ApiPropertyOptional({ description: 'Organization role' })
  @IsOptional()
  @IsString()
  orgRole?: string;

  @ApiPropertyOptional({ description: 'Institutional email' })
  @IsOptional()
  @IsString()
  orgWorkEmail?: string;

  @ApiPropertyOptional({ description: 'Organization website' })
  @IsOptional()
  @IsString()
  orgWebsite?: string;

  @ApiPropertyOptional({ description: 'Organization joined date' })
  @IsOptional()
  @IsString()
  orgJoined?: string;
}
