import { ApiProperty } from '@nestjs/swagger';
import { CourseSchoolYearDto } from './course-school-year.dto';

/**
 * DTO para la respuesta detallada de CourseSchoolYear
 */
export class CourseSchoolYearResponseDto extends CourseSchoolYearDto {
  @ApiProperty({ description: 'Información detallada de la asignatura' })
  course: {
    id: number;
    name: string;
    grade?: number;
  };

  @ApiProperty({ description: 'Información detallada del año escolar' })
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
