import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la respuesta de CourseSchoolYear
 */
export class CourseSchoolYearDto {
  @ApiProperty({ description: 'ID único de la asignatura en año escolar' })
  id: number;

  @ApiProperty({ description: 'Grado académico' })
  grade: number;

  @ApiProperty({ description: 'Horas semanales de la asignatura', required: false })
  weeklyHours?: number;

  @ApiProperty({ description: 'ID del profesor asignado', required: false })
  professorId?: number | null;

  @ApiProperty({ description: 'ID de la asignatura' })
  courseId: number;

  @ApiProperty({ description: 'ID del año escolar' })
  schoolYearId: number;

  @ApiProperty({ description: 'Nombre de la asignatura', required: false })
  courseName?: string;

  @ApiProperty({ description: 'Nombre del profesor', required: false })
  professorName?: string;

  @ApiProperty({ description: 'Código del año escolar', required: false })
  schoolYearCode?: string;
} 