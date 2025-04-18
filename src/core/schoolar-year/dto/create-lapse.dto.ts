import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsDateString, ValidateNested } from 'class-validator';
import {
  CreateScholarCourtDto,
  UpdateCreateScholarCourtDto,
} from './create-scholar-court.dto';
import { IsValidDate } from '@/common/decorators/isValidDate.decorator';

export class CreateLapseDto {
  @ApiProperty({
    description: 'Fecha de inicio del lapso',
    example: '2023-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del lapso',
    example: '2023-03-31',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  endDate: string;

  @ApiProperty({
    description: 'Corte del lapso',
    type: [CreateScholarCourtDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateScholarCourtDto)
  @IsNotEmpty()
  scholarCourts: CreateScholarCourtDto[];
}

export class UpdateCreateLapseDto {
  @ApiProperty({
    description: 'Número del lapso',
    example: 1,
  })
  @IsNotEmpty()
  lapseNumber: number;

  @ApiProperty({
    description: 'Fecha de inicio del lapso',
    example: '2023-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del lapso',
    example: '2023-03-31',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  endDate: string;

  @ApiProperty({
    description: 'Corte del lapso',
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateCreateScholarCourtDto)
  @IsNotEmpty()
  scholarCourts: UpdateCreateScholarCourtDto[];
}
