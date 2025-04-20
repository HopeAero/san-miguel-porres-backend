export class SchoolYearDetailsDto {
  id: number;
  code: string;
  startDate: string;
  endDate: string;

  // Contadores
  lapsesCount: number;
  courtsCount: number;
  coursesCount: number;

  // Relaciones
  schoolLapses?: SchoolLapseDetailsDto[];
  courseSchoolYears?: CourseSchoolYearDetailsDto[];
}

export class SchoolLapseDetailsDto {
  id: number;
  lapseNumber: number;
  startDate: string;
  endDate: string;
  schoolCourts?: SchoolCourtDetailsDto[];
}

export class SchoolCourtDetailsDto {
  id: number;
  courtNumber: number;
  startDate: string;
  endDate: string;
}

export class CourseSchoolYearDetailsDto {
  id: number;
  grade: number;
  weeklyHours?: number;
  professorId?: number;
  courseId: number;

  // Información expandida
  course?: {
    id: number;
    name: string;
  };

  professor?: {
    id: number;
    name: string;
  };
}
