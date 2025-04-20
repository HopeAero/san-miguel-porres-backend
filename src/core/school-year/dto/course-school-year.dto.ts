import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CourseSchoolYearDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  grade: number;

  @IsOptional()
  @IsNumber()
  weeklyHours?: number;

  @IsOptional()
  @IsNumber()
  professorId?: number | null;

  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}

export class CourseSchoolYearResponseDto {
  id: number;
  grade: number;
  weeklyHours?: number;
  professorId?: number | null;
  courseId: number;
  schoolYearId: number;

  // Relaciones expandidas
  course: {
    id: number;
    name: string;
  };

  professor?: {
    id: number;
    name: string;
  };
}
