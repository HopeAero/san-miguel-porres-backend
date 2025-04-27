import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la creación de CourseSchoolYear
 */
export class CreateCourseSchoolYearDto {
  @ApiProperty({ description: 'Grado académico' })
  @IsNotEmpty({ message: 'El grado es requerido' })
  @IsInt({ message: 'El grado debe ser un número entero' })
  @Min(1, { message: 'El grado debe ser un número positivo' })
  @Type(() => Number)
  readonly grade: number;

  @ApiProperty({ description: 'Horas semanales de la asignatura', required: false })
  @IsOptional()
  @IsInt({ message: 'Las horas semanales deben ser un número entero' })
  @Min(0, { message: 'Las horas semanales deben ser un número positivo o cero' })
  @Type(() => Number)
  readonly weeklyHours?: number;

  @ApiProperty({ description: 'ID de la asignatura' })
  @IsNotEmpty({ message: 'El ID de la asignatura es requerido' })
  @IsInt({ message: 'El ID de la asignatura debe ser un número entero' })
  @Min(1, { message: 'El ID de la asignatura debe ser un número positivo' })
  @Type(() => Number)
  readonly courseId: number;

  @ApiProperty({ description: 'ID del año escolar' })
  @IsNotEmpty({ message: 'El ID del año escolar es requerido' })
  @IsInt({ message: 'El ID del año escolar debe ser un número entero' })
  @Min(1, { message: 'El ID del año escolar debe ser un número positivo' })
  @Type(() => Number)
  readonly schoolYearId: number;

  @ApiProperty({ description: 'ID del profesor', required: false })
  @IsOptional()
  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  @Min(1, { message: 'El ID del profesor debe ser un número positivo' })
  @Type(() => Number)
  readonly professorId?: number;
} 