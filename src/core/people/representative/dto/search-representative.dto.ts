import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchRepresentativeDto {
  @ApiProperty({
    description: 'Texto para buscar por nombre o cédula (autocomplete)',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'Limitar la cantidad de resultados',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description:
      'IDs de representantes que deben incluirse siempre, separados por coma',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  forceItemsIds?: string;
}
