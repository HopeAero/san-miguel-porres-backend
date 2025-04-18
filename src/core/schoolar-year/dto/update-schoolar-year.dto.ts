import { ApiProperty } from '@nestjs/swagger';
import { UpdateCreateLapseDto } from './create-lapse.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSchoolarYearDto } from './create-schoolar-year.dto';

export class UpdateSchoolarYearDto {
  @ApiProperty({
    description: 'Año escolar',
    type: CreateSchoolarYearDto,
  })
  @ValidateNested()
  @Type(() => CreateSchoolarYearDto)
  schoolarYear: CreateSchoolarYearDto;

  @ApiProperty({
    description: 'Lapsos del año escolar',
    type: [UpdateCreateLapseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateCreateLapseDto)
  lapses: UpdateCreateLapseDto[];
}
