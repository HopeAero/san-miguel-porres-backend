import { ApiProperty } from '@nestjs/swagger';
import { EvaluationType } from '../entities/evaluation-type.enum';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsDateString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear/actualizar una evaluación
 */
export class EvaluationDto {
  @ApiProperty({ description: 'Nombre de la evaluación' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'ID del corte escolar' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  schoolCourtId: number;

  @ApiProperty({ description: 'ID del curso-año escolar' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  courseSchoolYearId: number;

  @ApiProperty({ description: 'Porcentaje de la evaluación', type: 'number' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage: number;

  @ApiProperty({ description: 'Tipo de evaluación', enum: EvaluationType })
  @IsEnum(EvaluationType)
  type: EvaluationType;

  @ApiProperty({ description: 'Número correlativo', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  correlative?: number;
  
  @ApiProperty({ description: 'Fecha proyectada', required: false })
  @IsOptional()
  @IsDateString()
  projectedDate?: string;
}

/**
 * DTO para respuesta de evaluación
 */
export class EvaluationResponseDto {
  @ApiProperty({ description: 'ID de la evaluación' })
  id: number;

  @ApiProperty({ description: 'Nombre de la evaluación' })
  name: string;

  @ApiProperty({ description: 'ID del corte escolar' })
  schoolCourtId: number;

  @ApiProperty({ description: 'ID del curso-año escolar' })
  courseSchoolYearId: number;

  @ApiProperty({ description: 'Porcentaje de la evaluación' })
  percentage: number;

  @ApiProperty({ description: 'Tipo de evaluación', enum: EvaluationType })
  type: EvaluationType;

  @ApiProperty({ description: 'Número correlativo', required: false })
  correlative?: number;

  @ApiProperty({ description: 'Fecha proyectada', required: false })
  projectedDate?: Date;

  @ApiProperty({ description: 'Fecha de creación' })
  creationDate: Date;
} 