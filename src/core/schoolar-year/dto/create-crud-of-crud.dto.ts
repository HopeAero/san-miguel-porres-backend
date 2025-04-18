import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateSchoolarYearDto } from './create-schoolar-year.dto';
import { CreateLapseDto } from './create-lapse.dto';

export class CreateCrudOfCrudSchoolarYearDto {
  @ApiProperty({
    description: 'Año escolar',
  })
  @ValidateNested()
  @Type(() => CreateSchoolarYearDto)
  schoolarYear: CreateSchoolarYearDto;

  @ApiProperty({
    description: 'Lapsos del año escolar',
    type: [CreateLapseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateLapseDto)
  lapses: CreateLapseDto[];
}
