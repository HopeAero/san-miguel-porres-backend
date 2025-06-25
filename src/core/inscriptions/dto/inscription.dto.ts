import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseInscriptionResponseDto } from './course-inscription.dto';

export class InscriptionDto {
  @ApiProperty({ description: 'ID de la inscripción', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'ID del estudiante' })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({ description: 'ID del año escolar' })
  @IsNumber()
  @IsNotEmpty()
  schoolYearId: number;

  @ApiProperty({ description: 'Grado del estudiante' })
  @IsNotEmpty()
  grade: number;
}

export class InscriptionResponseDto {
  @ApiProperty({ description: 'ID de la inscripción' })
  id: number;

  @ApiProperty({ description: 'ID del estudiante' })
  studentId: number;

  @ApiProperty({ description: 'ID del año escolar' })
  schoolYearId: number;

  @ApiProperty({ description: 'Grado del estudiante' })
  grade: number;

  @ApiProperty({ description: 'Información del año escolar' })
  schoolYear: {
    id: number;
    code: string;
  };

  @ApiProperty({ description: 'Información del estudiante', required: false })
  student?: {
    id: number;
    name: string;
    lastName?: string;
    dni?: string;
  };

  @ApiProperty({
    description: 'Información del representante',
    required: false,
  })
  representative?: {
    id: number;
    name: string;
    lastName?: string;
    dni?: string;
    fullInfo?: string;
  };

  @ApiProperty({
    description: 'Cursos inscritos',
    type: [CourseInscriptionResponseDto],
    required: false,
  })
  courseInscriptions?: CourseInscriptionResponseDto[];
}
