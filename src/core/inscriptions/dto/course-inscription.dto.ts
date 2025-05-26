import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { AttemptType } from '../entities/course-inscription.entity';

export class CourseInscriptionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  @IsNotEmpty()
  courseSchoolYearId: number;

  @IsNumber()
  @IsNotEmpty()
  inscriptionId: number;

  @IsOptional()
  @IsNumber()
  endQualification?: number | null;

  // No se incluyen attemptNumber y attemptType en el DTO para create/update
  // ya que se indicó que no deben usarse en esas operaciones
}

export class CourseInscriptionResponseDto {
  id: number;
  courseSchoolYearId: number;
  inscriptionId: number;
  studentId?: number;
  endQualification?: number | null;
  attemptNumber?: number;
  attemptType?: AttemptType;

  // Relaciones expandidas
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

  // Ya no incluimos la inscripción completa para evitar referencias circulares
  // La inscripción ya contiene esta información y es redundante aquí
}
