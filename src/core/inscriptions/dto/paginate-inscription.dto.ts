import { IsOptional, IsNumber, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page.option.dto';
import { InscriptionResponseDto } from './inscription.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '../../../common/dto/page.dto';
import { Transform } from 'class-transformer';

export class PaginateInscriptionDto extends PageOptionsDto {
  @ApiProperty({
    description: 'Filtrar por año escolar',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'schoolYearId debe ser un número válido' })
  schoolYearId?: number;

  @ApiProperty({
    description: 'Filtrar por grado',
    required: false,
  })
  @IsOptional()
  @IsString()
  gradeFilter?: string;

  @ApiProperty({
    description: 'Buscar por término (nombre de estudiante)',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginateInscriptionResponseDto extends PageDto<InscriptionResponseDto> {
  @ApiProperty({
    description: 'Lista de inscripciones paginadas',
    type: [InscriptionResponseDto],
  })
  items: InscriptionResponseDto[];
} 