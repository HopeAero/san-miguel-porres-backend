import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginateCourseSchoolYearAction } from './actions/paginate-course-school-year/paginate-course-school-year.action';
import { FindCourseSchoolYearAction } from './actions/find-course-school-year/find-course-school-year.action';
import { CreateCourseSchoolYearAction } from './actions/create-course-school-year/create-course-school-year.action';
import { UpdateCourseSchoolYearAction } from './actions/update-course-school-year/update-course-school-year.action';
import { RemoveCourseSchoolYearAction } from './actions/remove-course-school-year/remove-course-school-year.action';
import { PageDto } from '@/common/dto/page.dto';
import { CreateCourseSchoolYearDto } from './dto/create-course-school-year.dto';
import { UpdateCourseSchoolYearDto } from './dto/update-course-school-year.dto';
import { CourseSchoolYearResponseDto } from './dto/course-school-year-response.dto';
import {
  PaginateCourseSchoolYearDto,
  CourseSchoolYearPaginateResponseDto,
} from './dto/paginate-course-school-year.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSchoolYear } from '@/core/school-year/entities/course-school-year.entity';
import { CourseInscription } from '@/core/inscriptions/entities/course-inscription.entity';
import { StudentOfCourseDto } from './dto/student-of-course.dto';

@Injectable()
export class CourseSchoolYearService {
  constructor(
    private readonly paginateCourseSchoolYearAction: PaginateCourseSchoolYearAction,
    private readonly findCourseSchoolYearAction: FindCourseSchoolYearAction,
    private readonly createCourseSchoolYearAction: CreateCourseSchoolYearAction,
    private readonly updateCourseSchoolYearAction: UpdateCourseSchoolYearAction,
    private readonly removeCourseSchoolYearAction: RemoveCourseSchoolYearAction,
    @InjectRepository(CourseSchoolYear)
    private readonly courseSchoolYearRepository: Repository<CourseSchoolYear>,
    @InjectRepository(CourseInscription)
    private readonly courseInscriptionRepository: Repository<CourseInscription>,
  ) {}

  /**
   * Obtiene todas las asignaturas por año escolar sin paginación
   * @param schoolYearId ID del año escolar (opcional)
   * @param grade Grado o nivel educativo (opcional)
   * @returns Lista de asignaturas por año escolar
   */
  async findAllWithoutPagination(
    schoolYearId?: number,
    grade?: string,
  ): Promise<CourseSchoolYearResponseDto[]> {
    const queryBuilder = this.courseSchoolYearRepository
      .createQueryBuilder('courseSchoolYear')
      .leftJoinAndSelect('courseSchoolYear.course', 'course')
      .leftJoinAndSelect('courseSchoolYear.schoolYear', 'schoolYear')
      .leftJoinAndSelect('courseSchoolYear.professor', 'professor')
      .where('courseSchoolYear.deletedAt IS NULL');

    if (schoolYearId) {
      queryBuilder.andWhere('courseSchoolYear.schoolYearId = :schoolYearId', {
        schoolYearId,
      });
    }

    if (grade) {
      queryBuilder.andWhere('courseSchoolYear.grade = :grade', { grade });
    }

    queryBuilder.orderBy('courseSchoolYear.grade', 'ASC');
    queryBuilder.addOrderBy('course.name', 'ASC');

    const results = await queryBuilder.getMany();

    return results.map((entity) => {
      const dto = new CourseSchoolYearResponseDto();
      dto.id = entity.id;
      dto.grade = entity.grade;
      dto.weeklyHours = entity.weeklyHours;
      dto.courseId = entity.courseId;
      dto.schoolYearId = entity.schoolYearId;
      dto.professorId = entity.professorId;
      dto.course = entity.course;

      if (entity.schoolYear) {
        dto.schoolYear = {
          id: entity.schoolYear.id,
          code: entity.schoolYear.code,
          startDate: entity.schoolYear.startDate,
          endDate: entity.schoolYear.endDate,
        };
      }

      dto.professor = entity.professor
        ? {
            id: entity.professor.id,
            name:
              entity.professor.person?.name +
              ' ' +
              entity.professor.person?.lastName,
          }
        : null;
      return dto;
    });
  }

  /**
   * Obtiene todos los estudiantes inscritos en un curso-año escolar específico
   * @param courseSchoolYearId ID del curso-año escolar
   * @returns Lista de estudiantes con su calificación final
   */
  async findStudentsByCourseSchoolYear(
    courseSchoolYearId: number,
  ): Promise<StudentOfCourseDto[]> {
    // Verificar que el curso-año escolar existe
    const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
      where: { id: courseSchoolYearId, deletedAt: null },
    });

    if (!courseSchoolYear) {
      throw new NotFoundException(
        `Curso-año escolar con ID ${courseSchoolYearId} no encontrado`,
      );
    }

    // Construir una consulta para obtener los estudiantes inscritos
    const query = `
      SELECT 
        s.id AS studentId,
        p.name AS name,
        p."lastName" AS lastName,
        p.dni AS dni,
        ci."endQualification" AS endQualification
      FROM 
        course_inscriptions ci
      INNER JOIN 
        inscriptions i ON ci."inscriptionId" = i.id
      INNER JOIN 
        students s ON i."studentId" = s.id
      INNER JOIN 
        people p ON s.id = p.id
      WHERE 
        ci."courseSchoolYearId" = $1
        AND ci."deletedAt" IS NULL
        AND i."deletedAt" IS NULL
    `;

    // Ejecutar la consulta directamente
    const students = await this.courseInscriptionRepository.query(query, [
      courseSchoolYearId,
    ]);

    // Transformar los resultados al formato esperado
    return students.map((student) => ({
      id: student.studentid,
      name: student.name,
      lastName: student.lastname,
      dni: student.dni,
      endQualification: student.endqualification,
    }));
  }

  /**
   * Pagina y filtra asignaturas por año escolar
   * @param options Opciones de paginación y filtrado
   * @returns Datos paginados de asignaturas por año escolar
   */
  async paginate(
    options: PaginateCourseSchoolYearDto,
  ): Promise<PageDto<CourseSchoolYearPaginateResponseDto>> {
    return this.paginateCourseSchoolYearAction.execute(options);
  }

  /**
   * Obtiene una asignatura por año escolar por su ID
   * @param id ID de la asignatura por año escolar
   * @returns Datos de la asignatura por año escolar
   */
  async findOne(id: number): Promise<CourseSchoolYearResponseDto> {
    return this.findCourseSchoolYearAction.execute(id);
  }

  /**
   * Crea una nueva asignatura por año escolar
   * @param dto Datos para crear la asignatura por año escolar
   * @returns Datos de la asignatura por año escolar creada
   */
  async create(
    dto: CreateCourseSchoolYearDto,
  ): Promise<CourseSchoolYearResponseDto> {
    return this.createCourseSchoolYearAction.execute(dto);
  }

  /**
   * Actualiza una asignatura por año escolar existente
   * @param id ID de la asignatura por año escolar a actualizar
   * @param dto Datos para actualizar la asignatura por año escolar
   * @returns Datos de la asignatura por año escolar actualizada
   */
  async update(
    id: number,
    dto: UpdateCourseSchoolYearDto,
  ): Promise<CourseSchoolYearResponseDto> {
    return this.updateCourseSchoolYearAction.execute(id, dto);
  }

  /**
   * Elimina una asignatura por año escolar por su ID
   * @param id ID de la asignatura por año escolar a eliminar
   */
  async remove(id: number): Promise<void> {
    return this.removeCourseSchoolYearAction.execute(id);
  }
}
