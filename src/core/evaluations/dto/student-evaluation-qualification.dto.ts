import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para representar la calificación de un estudiante en una evaluación
 */
export class StudentEvaluationQualificationDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan',
  })
  name: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'Pérez',
  })
  lastName: string;

  @ApiProperty({
    description: 'Número de identificación del estudiante',
    example: '12345678',
  })
  dni: string;

  @ApiProperty({
    description: 'ID de la inscripción del estudiante en el curso',
    example: 1,
  })
  courseInscriptionId: number;

  @ApiProperty({
    description: 'Calificación obtenida en la evaluación',
    example: 18.5,
    required: false,
    nullable: true,
  })
  qualification: number | null;

  @ApiProperty({
    description: 'Fecha en que se registró la calificación',
    example: '2023-09-15',
    required: false,
    nullable: true,
  })
  qualificationDate: Date | null;

  @ApiProperty({
    description: 'Indica si el estudiante no presentó la evaluación',
    example: false,
  })
  didNotPresent: boolean;

  @ApiProperty({
    description: 'ID de la relación entre evaluación y estudiante (si existe)',
    example: 1,
    required: false,
    nullable: true,
  })
  evaluationCourseInscriptionId?: number | null;
}

/**
 * DTO para la respuesta con información detallada de una evaluación y las calificaciones de los estudiantes
 */
export class EvaluationWithStudentsResponseDto {
  @ApiProperty({
    description: 'ID de la evaluación',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la evaluación',
    example: 'Examen parcial 1',
  })
  name: string;

  @ApiProperty({
    description: 'ID del curso-año escolar',
    example: 1,
  })
  courseSchoolYearId: number;

  @ApiProperty({
    description: 'ID del corte escolar',
    example: 1,
  })
  schoolCourtId: number;

  @ApiProperty({
    description: 'Porcentaje que vale la evaluación',
    example: 25,
  })
  percentage: number;

  @ApiProperty({
    description: 'Tipo de evaluación',
    example: 'Examen',
  })
  type: string;

  @ApiProperty({
    description: 'Número correlativo de la evaluación',
    example: 1,
    required: false,
  })
  correlative?: number;

  @ApiProperty({
    description: 'Fecha proyectada para la evaluación',
    example: '2023-09-15',
    required: false,
    nullable: true,
  })
  projectedDate?: Date | null;

  @ApiProperty({
    description: 'Información del corte escolar',
    required: false,
  })
  schoolCourt?: any;

  @ApiProperty({
    description: 'Información del curso-año escolar',
    required: false,
  })
  courseSchoolYear?: any;

  @ApiProperty({
    description: 'Lista de estudiantes con sus calificaciones',
    type: [StudentEvaluationQualificationDto],
  })
  students: StudentEvaluationQualificationDto[];
}
