import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSchoolYearDto } from './create-school-year.dto';
import { UpdateInputSchoolLapseDto } from './update-input-school-lapse.dto';
import { CourseSchoolYearDto } from './course-school-year.dto';

export class UpdateSchoolYearDto {
  @ValidateNested()
  @Type(() => CreateSchoolYearDto)
  schoolYear: CreateSchoolYearDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInputSchoolLapseDto)
  schoolLapses: UpdateInputSchoolLapseDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseSchoolYearDto)
  courseSchoolYears?: CourseSchoolYearDto[];
}
