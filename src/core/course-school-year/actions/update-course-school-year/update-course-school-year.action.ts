import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';
import { Course } from '../../../courses/entities/course.entity';
import { SchoolYear } from '../../../school-year/entities/school-year.entity';
import { Employee } from '../../../people/employee/entities/employee.entity';
import { CourseSchoolYearResponseDto } from '../../dto/course-school-year-response.dto';
import { UpdateCourseSchoolYearDto } from '../../dto/update-course-school-year.dto';

@Injectable()
export class UpdateCourseSchoolYearAction {
  constructor(
    @InjectRepository(CourseSchoolYear)
    private readonly courseSchoolYearRepository: Repository<CourseSchoolYear>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(SchoolYear)
    private readonly schoolYearRepository: Repository<SchoolYear>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Actualiza una asignatura por año escolar existente
   * @param id ID de la asignatura por año escolar a actualizar
   * @param dto Datos para actualizar la asignatura por año escolar
   * @returns Datos de la asignatura por año escolar actualizada
   * @throws NotFoundException si no se encuentra la asignatura por año escolar
   */
  async execute(id: number, dto: UpdateCourseSchoolYearDto): Promise<CourseSchoolYearResponseDto> {
    // Buscar la entidad a actualizar
    const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
      where: { id },
    });

    if (!courseSchoolYear) {
      throw new NotFoundException(`Asignatura por año escolar con ID ${id} no encontrada`);
    }

    // Validar datos antes de actualizar
    await this.validate(id, dto);

    // Actualizar propiedades si están presentes en el DTO
    if (dto.grade !== undefined) {
      courseSchoolYear.grade = dto.grade;
    }

    if (dto.weeklyHours !== undefined) {
      courseSchoolYear.weeklyHours = dto.weeklyHours;
    }

    if (dto.courseId !== undefined) {
      courseSchoolYear.courseId = dto.courseId;
    }

    if (dto.schoolYearId !== undefined) {
      courseSchoolYear.schoolYearId = dto.schoolYearId;
    }

    if (dto.professorId !== undefined) {
      courseSchoolYear.professorId = dto.professorId;
    }

    // Guardar en la base de datos
    await this.courseSchoolYearRepository.save(courseSchoolYear);

    // Cargar entidad completa con relaciones
    const updated = await this.courseSchoolYearRepository
      .createQueryBuilder('csy')
      .leftJoinAndSelect('csy.course', 'course')
      .leftJoinAndSelect('csy.schoolYear', 'schoolYear')
      .leftJoinAndSelect('csy.professor', 'professor')
      .leftJoinAndSelect('professor.person', 'person')
      .where('csy.id = :id', { id })
      .getOne();

    // Mapear a DTO de respuesta
    return this.mapToResponseDto(updated);
  }

  /**
   * Valida los datos para actualizar una asignatura por año escolar
   * @param id ID de la asignatura por año escolar a actualizar
   * @param dto Datos a validar
   * @throws BadRequestException si alguna validación falla
   */
  private async validate(id: number, dto: UpdateCourseSchoolYearDto): Promise<void> {
    // Verificar que el curso existe (si se proporciona)
    if (dto.courseId !== undefined) {
      const course = await this.courseRepository.findOne({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new BadRequestException(`El curso con ID ${dto.courseId} no existe`);
      }
    }

    // Verificar que el año escolar existe (si se proporciona)
    if (dto.schoolYearId !== undefined) {
      const schoolYear = await this.schoolYearRepository.findOne({
        where: { id: dto.schoolYearId },
      });
      if (!schoolYear) {
        throw new BadRequestException(`El año escolar con ID ${dto.schoolYearId} no existe`);
      }
    }

    // Verificar que el profesor existe (si se proporciona)
    if (dto.professorId !== undefined) {
      const professor = await this.employeeRepository.findOne({
        where: { id: dto.professorId },
      });
      if (!professor) {
        throw new BadRequestException(`El profesor con ID ${dto.professorId} no existe`);
      }
    }

    // Verificar que no exista una combinación igual de curso, grado y año escolar (excepto la misma entidad)
    const currentEntity = await this.courseSchoolYearRepository.findOne({
      where: { id },
    });

    // Solo verificar si se está cambiando alguno de estos campos
    if (dto.courseId !== undefined || dto.grade !== undefined || dto.schoolYearId !== undefined) {
      const courseId = dto.courseId !== undefined ? dto.courseId : currentEntity.courseId;
      const grade = dto.grade !== undefined ? dto.grade : currentEntity.grade;
      const schoolYearId = dto.schoolYearId !== undefined ? dto.schoolYearId : currentEntity.schoolYearId;

      const existing = await this.courseSchoolYearRepository
        .createQueryBuilder('csy')
        .where('csy.courseId = :courseId', { courseId })
        .andWhere('csy.grade = :grade', { grade })
        .andWhere('csy.schoolYearId = :schoolYearId', { schoolYearId })
        .andWhere('csy.id != :id', { id })
        .andWhere('csy.deletedAt IS NULL')
        .getOne();

      if (existing) {
        throw new BadRequestException(
          `Ya existe una asignatura para el curso ${courseId} en el grado ${grade} y año escolar ${schoolYearId}`,
        );
      }
    }
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