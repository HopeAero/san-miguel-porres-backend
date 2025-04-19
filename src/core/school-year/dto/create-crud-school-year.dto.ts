import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateSchoolYearDto } from './create-school-year.dto';
import { CreateSchoolLapseDto } from './create-school-lapse.dto';

export class CreateCrudSchoolYearDto {
  @ApiProperty({
    description: 'Año escolar',
  })
  @ValidateNested()
  @Type(() => CreateSchoolYearDto)
  schoolYear: CreateSchoolYearDto;

  @ApiProperty({
    description: 'Lapsos del año escolar',
    type: [CreateSchoolLapseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateSchoolLapseDto)
  schoolLapses: CreateSchoolLapseDto[];
}
