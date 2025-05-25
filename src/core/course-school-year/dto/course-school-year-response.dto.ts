import { ApiProperty } from '@nestjs/swagger';
import { CourseSchoolYearDto } from './course-school-year.dto';

/**
 * DTO para la respuesta detallada de CourseSchoolYear
 */
export class CourseSchoolYearResponseDto extends CourseSchoolYearDto {
  @ApiProperty({
    description: 'Información detallada de la asignatura',
    type: () => ({
      id: Number,
      name: String,
      grade: Number,
    }),
  })
  course: {
    id: number;
    name: string;
    grade?: number;
  };

  @ApiProperty({
    description: 'Información detallada del año escolar',
    type: () => ({
      id: Number,
      code: String,
      startDate: String,
      endDate: String,
    }),
  })
  schoolYear: {
    id: number;
    code: string;
    startDate: string;
    endDate: string;
  };

  @ApiProperty({
    description: 'Información detallada del profesor',
    required: false,
  })
  professor?: {
    id: number;
    name: string;
    lastName?: string;
    email?: string;
  };
}
