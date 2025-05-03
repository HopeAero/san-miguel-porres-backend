import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateCourseInscriptionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  courseSchoolYearId: number;
}

export class UpdateInscriptionDto {
  @IsOptional()
  @IsNumber()
  studentId?: number;

  @IsOptional()
  @IsNumber()
  schoolYearId?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCourseInscriptionDto)
  courseInscriptions?: UpdateCourseInscriptionDto[];
} 