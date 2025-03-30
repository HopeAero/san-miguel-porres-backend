import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateSchoolarYearDto {
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
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin del año escolar',
    example: '2023-12-31',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}
