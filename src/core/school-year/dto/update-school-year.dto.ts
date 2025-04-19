import { ApiProperty } from '@nestjs/swagger';
import { UpdateCreateSchoolLapseDto } from './create-school-lapse.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSchoolYearDto } from './create-school-year.dto';

export class UpdateSchoolYearDto {
  @ApiProperty({
    description: 'Año escolar',
    type: CreateSchoolYearDto,
  })
  @ValidateNested()
  @Type(() => CreateSchoolYearDto)
  schoolYear: CreateSchoolYearDto;

  @ApiProperty({
    description: 'Lapsos del año escolar',
    type: [UpdateCreateSchoolLapseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateCreateSchoolLapseDto)
  schoolLapses: UpdateCreateSchoolLapseDto[];
}
