import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateCourseInscriptionDto {
  @IsNumber()
  @IsNotEmpty()
  courseSchoolYearId: number;
}

export class CreateInscriptionDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  schoolYearId: number;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseInscriptionDto)
  courseInscriptions?: CreateCourseInscriptionDto[];
} 