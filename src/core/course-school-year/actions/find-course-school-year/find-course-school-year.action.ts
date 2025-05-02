import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';
import { CourseSchoolYearResponseDto } from '../../dto/course-school-year-response.dto';

@Injectable()
export class FindCourseSchoolYearAction {
  constructor(
    @InjectRepository(CourseSchoolYear)
    private readonly courseSchoolYearRepository: Repository<CourseSchoolYear>,
  ) {}

  /**
   * Busca una asignatura por año escolar por su ID
   * @param id ID de la asignatura por año escolar
   * @returns Datos de la asignatura por año escolar
   * @throws NotFoundException si no se encuentra la asignatura
   */
  async execute(id: number): Promise<CourseSchoolYearResponseDto> {
    const courseSchoolYear = await this.courseSchoolYearRepository
      .createQueryBuilder('csy')
      .leftJoinAndSelect('csy.course', 'course')
      .leftJoinAndSelect('csy.schoolYear', 'schoolYear')
      .leftJoinAndSelect('csy.professor', 'professor')
      .leftJoinAndSelect('professor.person', 'person')
      .where('csy.id = :id', { id })
      .andWhere('csy.deletedAt IS NULL')
      .getOne();

    if (!courseSchoolYear) {
      throw new NotFoundException(`Asignatura por año escolar con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(courseSchoolYear);
  }

  /**
   * Mapea una entidad CourseSchoolYear a su DTO de respuesta
   * @param entity Entidad CourseSchoolYear
   * @returns DTO de respuesta
   */
  private mapToResponseDto(
    entity: CourseSchoolYear,
  ): CourseSchoolYearResponseDto {
    return {
      id: entity.id,
      grade: entity.grade,
      weeklyHours: entity.weeklyHours || 0,
      courseId: entity.courseId,
      schoolYearId: entity.schoolYearId,
      professorId: entity.professorId,
      course: entity.course ? {
        id: entity.course.id,
        name: entity.course.name,
      } : null,
      schoolYear: entity.schoolYear ? {
        id: entity.schoolYear.id,
        code: entity.schoolYear.code,
        startDate: entity.schoolYear.startDate,
        endDate: entity.schoolYear.endDate,
      } : null,
      professor: entity.professor && entity.professor.person ? {
        id: entity.professor.id,
        firstName: entity.professor.person.name,
        lastName: entity.professor.person.lastName,
        name: `${entity.professor.person.name} ${entity.professor.person.lastName}`,
      } : null,
    } as CourseSchoolYearResponseDto;
  }
} 