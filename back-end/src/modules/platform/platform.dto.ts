import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export class AdminQuery extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    status?: string;
    @IsOptional()
    @IsString()
    type?: string;
}
export class CourseDecision {
    @IsIn(['approve', 'reject'])
    decision: 'approve' | 'reject';
    @ValidateIf(o => o.decision === 'reject' || o.reason !== undefined)
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    reason?: string;
}
export class AdminProfile {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(160)
    name?: string;
    @IsOptional()
    @IsEmail()
    email?: string;
}

export class CourseEdit {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) title?:string;
  @IsOptional() @IsString() @MaxLength(10000) description?:string;
  @IsOptional() @IsString() category?:string;
  @IsOptional() @IsIn(['Beginner','Intermediate','Advanced']) level?:string;
}
