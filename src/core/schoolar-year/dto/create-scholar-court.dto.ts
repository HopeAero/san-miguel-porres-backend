import { IsValidDate } from '@/common/decorators/isValidDate.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateScholarCourtDto {
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
}

export class UpdateCreateScholarCourtDto {
  @ApiProperty({
    description: 'Número del lapso',
    example: 1,
  })
  @IsNotEmpty()
  courtNumber: number;

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
}
