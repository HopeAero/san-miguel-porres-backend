import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para representar una evaluación con la nota del estudiante específico
 */
export class StudentEvaluationGradeDto {
  @ApiProperty({
    description: 'ID de la evaluación',
    example: 1,
  })
  evaluationId: number;

  @ApiProperty({
    description: 'Nombre de la evaluación',
    example: 'Examen parcial 1',
  })
  evaluationName: string;

  @ApiProperty({
    description: 'Tipo de evaluación',
    example: 'Examen',
  })
  evaluationType: string;

  @ApiProperty({
    description: 'Porcentaje que vale la evaluación',
    example: 25,
  })
  percentage: number;

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
    description: 'Calificación obtenida por el estudiante en esta evaluación',
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
    description: 'Información del corte escolar',
  })
  schoolCourt: {
    id: number;
    lapseNumber: number;
    lapseName: string;
  };
}

/**
 * DTO para la respuesta completa con detalles de un estudiante y sus notas
 */
export class StudentGradesDetailResponseDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: 1,
  })
  studentId: number;

  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan',
  })
  studentName: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'Pérez',
  })
  studentLastName: string;

  @ApiProperty({
    description: 'Número de identificación del estudiante',
    example: '12345678',
  })
  studentDni: string;

  @ApiProperty({
    description: 'Calificación final actual del estudiante en el curso',
    example: 18.5,
    required: false,
    nullable: true,
  })
  finalGrade: number | null;

  @ApiProperty({
    description: 'Información básica del curso',
  })
  course: {
    id: number;
    name: string;
    grade: string;
  };

  @ApiProperty({
    description: 'Información básica del año escolar',
  })
  schoolYear: {
    id: number;
    code: string;
  };

  @ApiProperty({
    description: 'Lista de evaluaciones del curso con las notas del estudiante',
    type: [StudentEvaluationGradeDto],
  })
  evaluations: StudentEvaluationGradeDto[];
}
