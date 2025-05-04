import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  grade: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseInscriptionDto)
  courseInscriptions?: CreateCourseInscriptionDto[];
}
