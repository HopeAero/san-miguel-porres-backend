import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO simplificado para listar cursos por grado en selectores del frontend
 */
export class CourseByGradeDto {
  @ApiProperty({ description: 'ID único del curso' })
  @IsNumber()
  @IsOptional()
  id: number;

  @ApiProperty({ description: 'Nombre del curso' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'Nombre público del curso (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  publicName?: string;

  @ApiProperty({ description: 'Grado al que pertenece el curso' })
  @IsNumber()
  @IsOptional()
  grade: number;
}
