import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsDateString, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import {
  CreateSchoolCourtDto,
  UpdateCreateSchoolCourtDto,
} from './create-school-court.dto';
import { IsValidDate } from '@/common/decorators/isValidDate.decorator';

export class CreateSchoolLapseDto {
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
    description: 'Cortes escolares del lapso',
    type: [CreateSchoolCourtDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateSchoolCourtDto)
  @IsNotEmpty()
  schoolCourts: CreateSchoolCourtDto[];
}

export class UpdateCreateSchoolLapseDto {
  @ApiProperty({
    description: 'ID del lapso (solo para actualización)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Número del lapso',
    example: 1,
  })
  @IsOptional()
  lapseNumber?: number;

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
    description: 'Cortes escolares del lapso',
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateCreateSchoolCourtDto)
  @IsNotEmpty()
  schoolCourts: UpdateCreateSchoolCourtDto[];
}
