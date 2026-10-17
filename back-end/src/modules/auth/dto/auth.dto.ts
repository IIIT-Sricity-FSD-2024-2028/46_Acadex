import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'shivamani@iiits.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 'Instructor', enum: ['Student', 'Instructor', 'Organization', 'Admin', 'SuperAdmin'] })
  @IsOptional()
  @IsString()
  role?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Nishanth' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nishanth@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Student', enum: ['Student', 'Instructor', 'Organization', 'Admin', 'SuperAdmin'] })
  @IsString()
  role: 'Student' | 'Instructor' | 'Organization' | 'Admin' | 'SuperAdmin';

  @ApiPropertyOptional({ example: 'IIIT SRICITY' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: 'Computer Science & Full-stack' })
  @IsOptional()
  @IsString()
  expertise?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecretPass456!' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'nishanth@gmail.com' })
  @IsEmail()
  email: string;
}

export class PasswordResetConfirmDto {
  @ApiProperty({ example: 'nishanth@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482910' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'NewSecretPass456!' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
