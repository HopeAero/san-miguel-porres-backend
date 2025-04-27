import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';
import { PageDto } from '@/common/dto/page.dto';
import {
  CourseSchoolYearPaginateResponseDto,
  PaginateCourseSchoolYearDto,
} from '../../dto/paginate-course-school-year.dto';

@Injectable()
export class PaginateCourseSchoolYearAction {
  constructor(
    @InjectRepository(CourseSchoolYear)
    private readonly courseSchoolYearRepository: Repository<CourseSchoolYear>,
  ) {}

  /**
   * Pagina y filtra las asignaturas por año escolar
   * @param options Opciones de paginación y filtrado
   * @returns Datos paginados de asignaturas por año escolar
   */
  async execute(
    options: PaginateCourseSchoolYearDto,
  ): Promise<PageDto<CourseSchoolYearPaginateResponseDto>> {
    const queryBuilder = this.courseSchoolYearRepository
      .createQueryBuilder('csy')
      .leftJoinAndSelect('csy.course', 'course')
      .leftJoinAndSelect('csy.schoolYear', 'schoolYear')
      .leftJoinAndSelect('csy.professor', 'professor')
      .leftJoinAndSelect('professor.person', 'person')
      .where('csy.deletedAt IS NULL');

    // Aplicar filtros si están presentes
    if (options.schoolYearId) {
      queryBuilder.andWhere('csy.schoolYearId = :schoolYearId', {
        schoolYearId: options.schoolYearId,
      });
    }

    if (options.grade) {
      queryBuilder.andWhere('csy.grade = :grade', {
        grade: options.grade,
      });
    }

    if (options.professorId) {
      queryBuilder.andWhere('csy.professorId = :professorId', {
        professorId: options.professorId,
      });
    }

    // Búsqueda por término (nombre de curso)
    if (options.searchTerm && options.searchTerm.trim() !== '') {
      queryBuilder.andWhere('LOWER(course.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${options.searchTerm}%`,
      });
    }

    // Aplicar ordenamiento
    const orderBy = this.getOrderByField(options.orderBy);
    queryBuilder.orderBy(orderBy, options.order);

    // Contar total de items para paginación
    const itemCount = await queryBuilder.getCount();

    // Aplicar paginación
    queryBuilder.skip(options.skip).take(options.perPage);

    // Obtener resultados
    const items = await queryBuilder.getMany();

    // Mapear a DTO de respuesta
    const mappedItems = items.map((item) => this.mapToResponseDto(item));

    // Retornar datos paginados
    return new PageDto<CourseSchoolYearPaginateResponseDto>(
      mappedItems,
      itemCount,
      options,
    );
  }

  /**
   * Obtiene el campo para ordenamiento según el valor de orderBy
   * @param orderBy Campo por el que se ordenará
   * @returns Expresión SQL para ordenamiento
   */
  private getOrderByField(orderBy?: string): string {
    switch (orderBy) {
      case 'courseName':
        return 'course.name';
      case 'grade':
        return 'csy.grade';
      case 'professorName':
        return 'person.name';
      case 'weeklyHours':
        return 'csy.weeklyHours';
      default:
        return 'csy.grade';
    }
  }

  /**
   * Mapea una entidad CourseSchoolYear a su DTO de respuesta
   * @param entity Entidad CourseSchoolYear
   * @returns DTO de respuesta
   */
  private mapToResponseDto(
    entity: CourseSchoolYear,
  ): CourseSchoolYearPaginateResponseDto {
    return {
      id: entity.id,
      grade: entity.grade,
      weeklyHours: entity.weeklyHours || 0,
      courseId: entity.courseId,
      schoolYearId: entity.schoolYearId,
      professorId: entity.professorId,
      course: entity.course
        ? {
            id: entity.course.id,
            name: entity.course.name,
          }
        : null,
      schoolYear: entity.schoolYear
        ? {
            id: entity.schoolYear.id,
            code: entity.schoolYear.code,
          }
        : null,
      professor:
        entity.professor && entity.professor.person
          ? {
              id: entity.professor.id,
              name: `${entity.professor.person.name || ''} ${entity.professor.person.lastName || ''}`.trim(),
            }
          : entity.professorId
            ? { id: entity.professorId, name: 'Sin nombre' }
            : null,
    } as CourseSchoolYearPaginateResponseDto;
  }
}
