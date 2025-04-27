import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Order } from '@/common/constants/order.constant';
import { PageOptionsDto } from '@/common/dto/page.option.dto';

/**
 * DTO para la paginación de CourseSchoolYear
 */
export class PaginateCourseSchoolYearDto extends PageOptionsDto {
  @ApiProperty({ description: 'ID del año escolar para filtrar', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly schoolYearId?: number;

  @ApiProperty({ description: 'Grado académico para filtrar', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly grade?: number;

  @ApiProperty({ description: 'ID del profesor para filtrar', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly professorId?: number;

  @ApiProperty({ description: 'Campo por el que se ordenarán los resultados', required: false, enum: ['courseName', 'grade', 'professorName', 'weeklyHours'] })
  @IsOptional()
  @IsString()
  readonly orderBy?: string = 'grade';

  @ApiProperty({ description: 'Dirección del ordenamiento', required: false, enum: Order })
  @IsOptional()
  @IsEnum(Order)
  readonly order?: Order = Order.ASC;
}

/**
 * DTO para la respuesta paginada de CourseSchoolYear
 */
export class CourseSchoolYearPaginateResponseDto {
  @ApiProperty({ description: 'ID único de la asignatura en año escolar' })
  id: number;

  @ApiProperty({ description: 'Grado académico' })
  grade: number;

  @ApiProperty({ description: 'Horas semanales de la asignatura' })
  weeklyHours: number;

  @ApiProperty({ description: 'Información de la asignatura' })
  course: {
    id: number;
    name: string;
  };

  @ApiProperty({ description: 'Información del año escolar' })
  schoolYear: {
    id: number;
    code: string;
  };

  @ApiProperty({ description: 'Información del profesor', required: false })
  professor?: {
    id: number;
    name: string;
  };
} 