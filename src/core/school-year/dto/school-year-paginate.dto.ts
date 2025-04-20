export class SchoolYearPaginateDto {
  id: number;
  code: string;
  startDate: string;
  endDate: string;

  // Contadores
  lapsesCount: number;
  courtsCount: number;
  coursesCount: number;

  // Metadata de paginación
  createdAt?: Date;
  updatedAt?: Date;
}

export class SchoolYearPaginateResponseDto {
  items: SchoolYearPaginateDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
