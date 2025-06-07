import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para representar un estudiante inscrito en un curso-año escolar
 */
export class StudentOfCourseDto {
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
    description: 'Calificación final del estudiante en el curso',
    example: 18.5,
    required: false,
    nullable: true,
  })
  endQualification?: number | null;
} 