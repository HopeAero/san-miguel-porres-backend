import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { Repository, In } from 'typeorm';
import { CourseSchoolYear } from '@/core/school-year/entities/course-school-year.entity';
import { CourseInscription } from '@/core/inscriptions/entities/course-inscription.entity';
import { StudentOfCourseDto } from './dto/student-of-course.dto';
import { StudentGradesDetailResponseDto } from './dto/student-grades-detail.dto';
import { UpdateStudentGradesDto } from './dto/update-student-grades.dto';
import { Evaluation } from '@/core/evaluations/entities/evaluation.entity';
import { EvaluationCourseInscription } from '@/core/evaluations/entities/evaluation-course-inscription.entity';

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
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationCourseInscription)
    private readonly evaluationCourseInscriptionRepository: Repository<EvaluationCourseInscription>,
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
   * Obtiene los detalles de las notas de un estudiante específico en un curso-año escolar
   * @param courseSchoolYearId ID del curso-año escolar
   * @param studentId ID del estudiante
   * @returns Detalles completos de las notas del estudiante
   */
  async getStudentGradesDetail(
    courseSchoolYearId: number,
    studentId: number,
  ): Promise<StudentGradesDetailResponseDto> {
    // Verificar que el curso-año escolar existe y obtener información básica
    const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
      where: { id: courseSchoolYearId, deletedAt: null },
      relations: ['course', 'schoolYear'],
    });

    if (!courseSchoolYear) {
      throw new NotFoundException(
        `Curso-año escolar con ID ${courseSchoolYearId} no encontrado`,
      );
    }

    // Buscar la inscripción del estudiante en este curso
    const query = `
      SELECT 
        s.id AS studentId,
        p.name AS name,
        p."lastName" AS lastName,
        p.dni AS dni,
        ci."endQualification" AS endQualification,
        ci.id AS courseInscriptionId
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
        AND s.id = $2
        AND ci."deletedAt" IS NULL
        AND i."deletedAt" IS NULL
    `;

    const studentResult = await this.courseInscriptionRepository.query(query, [
      courseSchoolYearId,
      studentId,
    ]);

    if (!studentResult || studentResult.length === 0) {
      throw new NotFoundException(
        `Estudiante con ID ${studentId} no está inscrito en el curso-año escolar con ID ${courseSchoolYearId}`,
      );
    }

    const student = studentResult[0];
    const courseInscriptionId = student.courseinscriptionid;

    // Obtener todas las evaluaciones del curso con sus notas del estudiante
    const evaluations = await this.evaluationRepository.find({
      where: { courseSchoolYearId, deletedAt: null },
      relations: ['schoolCourt', 'schoolCourt.schoolLapse'],
      order: {
        schoolCourt: { schoolLapse: { lapseNumber: 'ASC' } },
        correlative: 'ASC',
      },
    });

    // Para cada evaluación, buscar la nota del estudiante
    const evaluationsWithGrades = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluationGrade = await this.evaluationCourseInscriptionRepository.findOne({
          where: {
            evaluationId: evaluation.id,
            courseInscriptionId: courseInscriptionId,
            deletedAt: null,
          },
        });

        return {
          evaluationId: evaluation.id,
          evaluationName: evaluation.name,
          evaluationType: evaluation.type,
          percentage: evaluation.percentage,
          correlative: evaluation.correlative,
          projectedDate: evaluation.projectedDate,
          qualification: evaluationGrade?.qualification || null,
          qualificationDate: evaluationGrade?.qualificationDate || null,
          didNotPresent: evaluationGrade?.didNotPresent || false,
          schoolCourt: {
            id: evaluation.schoolCourt.id,
            lapseNumber: evaluation.schoolCourt.schoolLapse.lapseNumber,
            lapseName: `Lapso ${evaluation.schoolCourt.schoolLapse.lapseNumber}`,
          },
        };
      })
    );

    // Construir la respuesta completa
    const response: StudentGradesDetailResponseDto = {
      studentId: student.studentid,
      studentName: student.name,
      studentLastName: student.lastname,
      studentDni: student.dni,
      finalGrade: student.endqualification,
      course: {
        id: courseSchoolYear.course.id,
        name: courseSchoolYear.course.name,
        grade: courseSchoolYear.grade.toString(),
      },
      schoolYear: {
        id: courseSchoolYear.schoolYear.id,
        code: courseSchoolYear.schoolYear.code,
      },
      evaluations: evaluationsWithGrades,
    };

    return response;
  }

  /**
   * Actualiza todas las notas de un estudiante específico en un curso-año escolar
   * @param courseSchoolYearId ID del curso-año escolar
   * @param studentId ID del estudiante
   * @param updateDto DTO con las notas a actualizar
   * @returns Resultado de la actualización
   */
  async updateStudentGrades(
    courseSchoolYearId: number,
    studentId: number,
    updateDto: UpdateStudentGradesDto,
  ) {
    // Verificar que el curso-año escolar existe
    const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
      where: { id: courseSchoolYearId, deletedAt: null },
    });

    if (!courseSchoolYear) {
      throw new NotFoundException(
        `Curso-año escolar con ID ${courseSchoolYearId} no encontrado`,
      );
    }

    // Buscar la inscripción del estudiante en este curso
    const query = `
      SELECT 
        ci.id AS courseInscriptionId
      FROM 
        course_inscriptions ci
      INNER JOIN 
        inscriptions i ON ci."inscriptionId" = i.id
      INNER JOIN 
        students s ON i."studentId" = s.id
      WHERE 
        ci."courseSchoolYearId" = $1
        AND s.id = $2
        AND ci."deletedAt" IS NULL
        AND i."deletedAt" IS NULL
    `;

    const studentResult = await this.courseInscriptionRepository.query(query, [
      courseSchoolYearId,
      studentId,
    ]);

    if (!studentResult || studentResult.length === 0) {
      throw new NotFoundException(
        `Estudiante con ID ${studentId} no está inscrito en el curso-año escolar con ID ${courseSchoolYearId}`,
      );
    }

    const courseInscriptionId = studentResult[0].courseinscriptionid;

    // Verificar que todas las evaluaciones pertenecen al curso
    const evaluationIds = updateDto.evaluations.map(e => e.evaluationId);
    const evaluations = await this.evaluationRepository.find({
      where: { 
        id: In(evaluationIds),
        courseSchoolYearId,
        deletedAt: null 
      },
    });

    if (evaluations.length !== evaluationIds.length) {
      throw new BadRequestException(
        'Una o más evaluaciones no existen o no pertenecen al curso especificado',
      );
    }

    // Obtener las calificaciones existentes para este estudiante
    const existingGrades = await this.evaluationCourseInscriptionRepository.find({
      where: {
        courseInscriptionId: courseInscriptionId,
        evaluationId: In(evaluationIds),
        deletedAt: null,
      },
    });

    // Crear un mapa para acceso rápido a las calificaciones existentes
    const gradesMap = new Map<number, EvaluationCourseInscription>();
    existingGrades.forEach((grade) => {
      gradesMap.set(grade.evaluationId, grade);
    });

    // Procesar cada calificación
    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    for (const evaluationUpdate of updateDto.evaluations) {
      try {
        const existingGrade = gradesMap.get(evaluationUpdate.evaluationId);

        if (existingGrade) {
          // Actualizar calificación existente
          existingGrade.qualification = evaluationUpdate.qualification ?? null;
          existingGrade.didNotPresent = evaluationUpdate.didNotPresent ?? false;
          existingGrade.qualificationDate = evaluationUpdate.qualification !== null && evaluationUpdate.qualification !== undefined
            ? new Date() 
            : null;

          await this.evaluationCourseInscriptionRepository.save(existingGrade);
          results.updated++;
        } else {
          // Crear nueva calificación
          const newGrade = this.evaluationCourseInscriptionRepository.create({
            evaluationId: evaluationUpdate.evaluationId,
            courseInscriptionId: courseInscriptionId,
            qualification: evaluationUpdate.qualification ?? null,
            didNotPresent: evaluationUpdate.didNotPresent ?? false,
            qualificationDate: evaluationUpdate.qualification !== null && evaluationUpdate.qualification !== undefined
              ? new Date()
              : null,
          });

          await this.evaluationCourseInscriptionRepository.save(newGrade);
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          evaluationId: evaluationUpdate.evaluationId,
          error: error.message,
        });
      }
    }

    return {
      message: 'Calificaciones procesadas correctamente',
      results,
    };
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
