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

  inscription: {
    id: number;
    studentId: number;
    grade: string;
    student: {
      id: number;
      name: string;
    };
  };
}
