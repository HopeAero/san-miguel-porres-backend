import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

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
}

export class CourseInscriptionResponseDto {
  id: number;
  courseSchoolYearId: number;
  inscriptionId: number;
  studentId?: number;

  // Relaciones expandidas
  courseSchoolYear: {
    id: number;
    grade: string;
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
