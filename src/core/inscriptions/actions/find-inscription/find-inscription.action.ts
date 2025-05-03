import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscription } from '../../entities/inscription.entity';
import { InscriptionResponseDto } from '../../dto/inscription.dto';
import { CourseInscriptionResponseDto } from '../../dto/course-inscription.dto';

@Injectable()
export class FindInscriptionAction {
  constructor(
    @InjectRepository(Inscription)
    private inscriptionRepository: Repository<Inscription>,
  ) {}

  async execute(id: number): Promise<InscriptionResponseDto> {
    // Buscar la inscripción con todas sus relaciones
    const inscription = await this.inscriptionRepository.findOne({
      where: { id, deletedAt: null },
      relations: [
        'schoolYear',
        'courseInscriptions',
        'courseInscriptions.courseSchoolYear',
        'courseInscriptions.courseSchoolYear.course',
        'courseInscriptions.courseSchoolYear.professor',
      ],
    });

    if (!inscription) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }

    // Obtener información del estudiante (necesitamos usar un query raw para evitar dependencias circulares)
    const queryRunner =
      this.inscriptionRepository.manager.connection.createQueryRunner();
    try {
      await queryRunner.connect();

      const students = await queryRunner.manager.query(
        `
        SELECT s.id, p.name, p."lastName", p.dni
        FROM students s
        JOIN people p ON s."id" = p.id
        WHERE s.id = $1 AND s."deletedAt" IS NULL
      `,
        [inscription.studentId],
      );

      // Mapear la entidad a un DTO de respuesta
      const response = this.mapToResponseDto(
        inscription,
        students && students.length > 0 ? students[0] : null,
      );

      return response;
    } finally {
      await queryRunner.release();
    }
  }

  private mapToResponseDto(
    inscription: Inscription,
    student: {
      id: number;
      name: string;
      lastName: string;
      dni: string;
    } | null,
  ): InscriptionResponseDto {
    const responseDto = new InscriptionResponseDto();

    responseDto.id = inscription.id;
    responseDto.studentId = inscription.studentId;
    responseDto.schoolYearId = inscription.schoolYearId;
    responseDto.grade = inscription.grade;

    // Información del año escolar
    if (inscription.schoolYear) {
      responseDto.schoolYear = {
        id: inscription.schoolYear.id,
        code: inscription.schoolYear.code,
      };
    }

    // Información del estudiante
    if (student) {
      responseDto.student = {
        id: student.id,
        name: student.name,
      };
    }

    // Información de inscripciones de asignaturas
    if (
      inscription.courseInscriptions &&
      inscription.courseInscriptions.length > 0
    ) {
      responseDto.courseInscriptions = inscription.courseInscriptions.map(
        (ci) => {
          const courseInscriptionDto = new CourseInscriptionResponseDto();

          courseInscriptionDto.id = ci.id;
          courseInscriptionDto.courseSchoolYearId = ci.courseSchoolYearId;
          courseInscriptionDto.inscriptionId = ci.inscriptionId;

          // Información de la asignatura en el año escolar
          if (ci.courseSchoolYear) {
            courseInscriptionDto.courseSchoolYear = {
              id: ci.courseSchoolYear.id,
              grade: String(ci.courseSchoolYear.grade), // Convertir a string para cumplir con el DTO
              courseId: ci.courseSchoolYear.courseId,
              course: ci.courseSchoolYear.course
                ? {
                    id: ci.courseSchoolYear.course.id,
                    name: ci.courseSchoolYear.course.name,
                  }
                : undefined,
              professor: ci.courseSchoolYear.professor
                ? {
                    id: ci.courseSchoolYear.professor.id,
                    name: 'Profesor', // Usamos un valor por defecto ya que no tenemos acceso directo al nombre
                  }
                : undefined,
            };
          }

          return courseInscriptionDto;
        },
      );
    }

    return responseDto;
  }
}
