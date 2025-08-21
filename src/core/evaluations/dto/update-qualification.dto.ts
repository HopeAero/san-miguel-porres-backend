import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para actualizar la calificación de un estudiante en una evaluación
 */
export class UpdateQualificationDto {
  @ApiProperty({
    description: 'ID de la inscripción del estudiante en el curso',
    example: 1,
  })
  @IsNumber()
  courseInscriptionId: number;

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
 * DTO para actualizar calificaciones de múltiples estudiantes en una evaluación
 */
export class BulkUpdateQualificationsDto {
  @ApiProperty({
    description: 'Lista de calificaciones a actualizar',
    type: [UpdateQualificationDto],
  })
  qualifications: UpdateQualificationDto[];
}
