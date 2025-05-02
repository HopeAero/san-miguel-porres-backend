import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';
import { Course } from '../../../courses/entities/course.entity';
import { SchoolYear } from '../../../school-year/entities/school-year.entity';
import { Employee } from '../../../people/employee/entities/employee.entity';
import { CourseSchoolYearResponseDto } from '../../dto/course-school-year-response.dto';
import { CreateCourseSchoolYearDto } from '../../dto/create-course-school-year.dto';

@Injectable()
export class CreateCourseSchoolYearAction {
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
   * Crea una nueva asignatura por año escolar
   * @param dto Datos para crear la asignatura por año escolar
   * @returns Datos de la asignatura por año escolar creada
   */
  async execute(dto: CreateCourseSchoolYearDto): Promise<CourseSchoolYearResponseDto> {
    // Validar datos antes de crear
    await this.validate(dto);

    // Crear nueva entidad
    const courseSchoolYear = this.courseSchoolYearRepository.create({
      grade: dto.grade,
      weeklyHours: dto.weeklyHours,
      courseId: dto.courseId,
      schoolYearId: dto.schoolYearId,
      professorId: dto.professorId,
    });

    // Guardar en la base de datos
    await this.courseSchoolYearRepository.save(courseSchoolYear);

    // Cargar entidad completa con relaciones
    const created = await this.courseSchoolYearRepository
      .createQueryBuilder('csy')
      .leftJoinAndSelect('csy.course', 'course')
      .leftJoinAndSelect('csy.schoolYear', 'schoolYear')
      .leftJoinAndSelect('csy.professor', 'professor')
      .leftJoinAndSelect('professor.person', 'person')
      .where('csy.id = :id', { id: courseSchoolYear.id })
      .getOne();

    // Mapear a DTO de respuesta
    return this.mapToResponseDto(created);
  }

  /**
   * Valida los datos para crear una asignatura por año escolar
   * @param dto Datos a validar
   * @throws BadRequestException si alguna validación falla
   */
  private async validate(dto: CreateCourseSchoolYearDto): Promise<void> {
    // Verificar que el curso existe
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new BadRequestException(`El curso con ID ${dto.courseId} no existe`);
    }

    // Verificar que el año escolar existe
    const schoolYear = await this.schoolYearRepository.findOne({
      where: { id: dto.schoolYearId },
    });
    if (!schoolYear) {
      throw new BadRequestException(`El año escolar con ID ${dto.schoolYearId} no existe`);
    }

    // Verificar que el profesor existe (si se proporciona)
    if (dto.professorId) {
      const professor = await this.employeeRepository.findOne({
        where: { id: dto.professorId },
      });
      if (!professor) {
        throw new BadRequestException(`El profesor con ID ${dto.professorId} no existe`);
      }
    }

    // Verificar que no exista una combinación igual de curso, grado y año escolar
    const existing = await this.courseSchoolYearRepository.findOne({
      where: {
        courseId: dto.courseId,
        grade: dto.grade,
        schoolYearId: dto.schoolYearId,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Ya existe una asignatura para el curso ${dto.courseId} en el grado ${dto.grade} y año escolar ${dto.schoolYearId}`,
      );
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