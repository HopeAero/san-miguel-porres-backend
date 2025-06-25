import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttemptType } from '../entities/course-inscription.entity';

export class CourseInscriptionDto {
  @ApiProperty({
    description: 'ID de la inscripción de curso',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'ID del curso en año escolar' })
  @IsNumber()
  @IsNotEmpty()
  courseSchoolYearId: number;

  @ApiProperty({ description: 'ID de la inscripción' })
  @IsNumber()
  @IsNotEmpty()
  inscriptionId: number;

  @ApiProperty({ description: 'Calificación final', required: false })
  @IsOptional()
  @IsNumber()
  endQualification?: number | null;

  // No se incluyen attemptNumber y attemptType en el DTO para create/update
  // ya que se indicó que no deben usarse en esas operaciones
}

export class CourseInscriptionResponseDto {
  @ApiProperty({ description: 'ID de la inscripción de curso' })
  id: number;

  @ApiProperty({ description: 'ID del curso en año escolar' })
  courseSchoolYearId: number;

  @ApiProperty({ description: 'ID de la inscripción' })
  inscriptionId: number;

  @ApiProperty({ description: 'ID del estudiante', required: false })
  studentId?: number;

  @ApiProperty({ description: 'Calificación final', required: false })
  endQualification?: number | null;

  @ApiProperty({ description: 'Número de intento', required: false })
  attemptNumber?: number;

  @ApiProperty({
    description: 'Tipo de intento',
    enum: AttemptType,
    required: false,
  })
  attemptType?: AttemptType;

  @ApiProperty({ description: 'Información del curso en año escolar' })
  courseSchoolYear: {
    id: number;
    grade: number;
    courseId: number;
    course: {
      id: number;
      name: string;
    };
    professor?: {
      id: number;
      name: string;
    };
  };

  // Relaciones expandidas
  // La inscripción ya contiene esta información y es redundante aquí
}
