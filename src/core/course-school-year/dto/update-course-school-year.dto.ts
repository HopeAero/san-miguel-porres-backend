import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la actualización de CourseSchoolYear
 */
export class UpdateCourseSchoolYearDto {
  @ApiProperty({ description: 'Grado académico', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly grade?: number;

  @ApiProperty({
    description: 'Horas semanales de la asignatura',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly weeklyHours?: number;

  @ApiProperty({ description: 'ID de la asignatura', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly courseId?: number;

  @ApiProperty({ description: 'ID del año escolar', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly schoolYearId?: number;

  @ApiProperty({ description: 'ID del profesor', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly professorId?: number;
}
