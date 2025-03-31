import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateLapseDto {
  @ApiProperty({
    description: 'Fecha de inicio del lapso',
    example: '2023-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin del lapso',
    example: '2023-03-31',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
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
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin del lapso',
    example: '2023-03-31',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}
