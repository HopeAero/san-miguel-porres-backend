import { IsValidDate } from '@/common/decorators/isValidDate.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSchoolCourtDto {
  @ApiProperty({
    description: 'Fecha de inicio del corte escolar',
    example: '2023-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del corte escolar',
    example: '2023-03-31',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  endDate: string;
}

export class UpdateCreateSchoolCourtDto {
  @ApiProperty({
    description: 'ID del corte (solo para actualización)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Número del corte escolar',
    example: 1,
  })
  @IsOptional()
  courtNumber?: number;

  @ApiProperty({
    description: 'Fecha de inicio del corte escolar',
    example: '2023-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del corte escolar',
    example: '2023-03-31',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsValidDate()
  endDate: string;
}
