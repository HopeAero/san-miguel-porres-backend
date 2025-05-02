import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CourseInscriptionResponseDto } from './course-inscription.dto';

export class InscriptionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  schoolYearId: number;

  @IsNotEmpty()
  grade: string;
}

export class InscriptionResponseDto {
  id: number;
  studentId: number;
  schoolYearId: number;
  grade: string;

  // Relaciones expandidas
  schoolYear: {
    id: number;
    code: string;
  };

  // Información del estudiante (será proporcionada por el servicio)
  student?: {
    id: number;
    name: string;
    lastName?: string;
    dni?: string;
  };

  // Información del representante (será proporcionada por el servicio)
  representative?: {
    id: number;
    name: string;
    lastName?: string;
    dni?: string;
    fullInfo?: string;
  };

  // Cursos inscritos - Ahora usando el DTO CourseInscriptionResponseDto
  courseInscriptions?: CourseInscriptionResponseDto[];
}
