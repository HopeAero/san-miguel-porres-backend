import { IsValidDate } from '@/common/decorators/isValidDate.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseSchoolYearDto } from './course-school-year.dto';

export class CreateSchoolYearDto {
  @ApiProperty({
    description: 'Nombre del año escolar',
    example: '2023-2024',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Fecha de inicio del año escolar',
    example: '2023-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del año escolar',
    example: '2023-12-31',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  endDate: string;

  @ApiProperty({
    description: 'Asignaturas asociadas al año escolar',
    type: [CourseSchoolYearDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseSchoolYearDto)
  courseSchoolYears?: CourseSchoolYearDto[];
}
