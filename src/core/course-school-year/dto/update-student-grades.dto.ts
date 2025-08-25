import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsDate, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para actualizar la calificación de una evaluación específica del estudiante
 */
export class UpdateStudentEvaluationGradeDto {
  @ApiProperty({
    description: 'ID de la evaluación',
    example: 1,
  })
  @IsNumber()
  evaluationId: number;

  @ApiProperty({
    description: 'Calificación obtenida en la evaluación (de 0 a 20)',
    example: 18.5,
    required: false,
    nullable: true,
    minimum: 0,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La calificación debe ser un número válido' })
  @Min(0, { message: 'La calificación no puede ser menor a 0' })
  @Max(20, { message: 'La calificación no puede ser mayor a 20' })
  qualification?: number | null;

  @ApiProperty({
    description: 'Indica si el estudiante no presentó la evaluación',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  didNotPresent?: boolean;

  @ApiProperty({
    description: 'Fecha en que se registró la calificación',
    example: '2023-09-15',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  qualificationDate?: Date | null;
}

/**
 * DTO para actualizar todas las calificaciones de un estudiante en un curso
 */
export class UpdateStudentGradesDto {
  @ApiProperty({
    description: 'Lista de calificaciones a actualizar por evaluación',
    type: [UpdateStudentEvaluationGradeDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStudentEvaluationGradeDto)
  evaluations: UpdateStudentEvaluationGradeDto[];
}
