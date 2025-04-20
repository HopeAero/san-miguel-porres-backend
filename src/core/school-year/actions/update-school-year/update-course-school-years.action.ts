import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CourseSchoolYear } from '../../entities/course-school-year.entity';
import { CourseSchoolYearDto } from '../../dto/course-school-year.dto';
import { Course } from '../../../courses/entities/course.entity';

@Injectable()
export class UpdateCourseSchoolYearsAction {
  constructor(
    @InjectRepository(CourseSchoolYear)
    private courseSchoolYearRepository: Repository<CourseSchoolYear>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  /**
   * Actualiza las asignaturas asociadas a un año escolar
   */
  async execute(
    schoolYearId: number,
    courseSchoolYears: CourseSchoolYearDto[] = [],
  ): Promise<CourseSchoolYear[]> {
    if (!courseSchoolYears.length) {
      return [];
    }

    // Validar que todos los cursos existen y no están eliminados
    await this.validateCourses(courseSchoolYears);

    // Obtener asignaturas existentes para este año escolar
    const existingCourseSchoolYears =
      await this.courseSchoolYearRepository.find({
        where: { schoolYearId },
      });

    // Identificar los IDs de asignaturas a eliminar y las que hay que actualizar o crear
    const existingIds = existingCourseSchoolYears.map((course) => course.id);
    const incomingIds = courseSchoolYears
      .filter((dto) => dto.id)
      .map((dto) => dto.id);

    // Eliminar asignaturas que ya no existen en el array entrante (usando softDelete)
    const idsToRemove = existingIds.filter((id) => !incomingIds.includes(id));
    if (idsToRemove.length > 0) {
      await Promise.all(
        idsToRemove.map(
          async (id) => await this.courseSchoolYearRepository.softDelete(id),
        ),
      );
    }

    // Procesar cada asignatura entrante
    const savedCourses: CourseSchoolYear[] = [];

    for (const courseDto of courseSchoolYears) {
      if (courseDto.id) {
        // Actualizar asignatura existente
        await this.courseSchoolYearRepository.update(courseDto.id, {
          grade: courseDto.grade,
          weeklyHours: courseDto.weeklyHours,
          professorId: courseDto.professorId,
          courseId: courseDto.courseId,
        });

        const updated = await this.courseSchoolYearRepository.findOne({
          where: { id: courseDto.id },
        });

        if (updated) {
          savedCourses.push(updated);
        }
      } else {
        // Crear nueva asignatura
        const newCourse = this.courseSchoolYearRepository.create({
          grade: courseDto.grade,
          weeklyHours: courseDto.weeklyHours,
          professorId: courseDto.professorId,
          courseId: courseDto.courseId,
          schoolYearId,
        });

        const saved = await this.courseSchoolYearRepository.save(newCourse);
        savedCourses.push(saved);
      }
    }

    return savedCourses;
  }

  /**
   * Valida que todos los cursos especificados existan y no estén eliminados
   */
  private async validateCourses(
    courseSchoolYears: CourseSchoolYearDto[],
  ): Promise<void> {
    // Extraer los IDs de cursos de los DTOs
    const courseIds = courseSchoolYears.map((dto) => dto.courseId);

    // Buscar los cursos en la base de datos
    const existingCourses = await this.courseRepository.find({
      where: {
        id: In(courseIds),
        deletedAt: null, // Solo cursos no eliminados
      },
      select: ['id'], // Solo necesitamos los IDs
    });

    const existingCourseIds = existingCourses.map((course) => course.id);

    // Verificar si hay algún curso que no existe o está eliminado
    const missingCourseIds = courseIds.filter(
      (id) => !existingCourseIds.includes(id),
    );

    if (missingCourseIds.length > 0) {
      throw new NotFoundException(
        `Los siguientes cursos no existen o están eliminados: ${missingCourseIds.join(', ')}`,
      );
    }
  }
}
