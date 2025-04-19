import { IsValidDate } from '@/common/decorators/isValidDate.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

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
    description: 'Número del corte escolar',
    example: 1,
  })
  @IsNotEmpty()
  courtNumber: number;

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
