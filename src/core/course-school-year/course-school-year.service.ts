import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { UpdateStudentQualificationsDto } from './dto/update-student-qualifications.dto';
import { UpdateFinalQualificationDto } from './dto/update-final-qualification.dto';
import { Evaluation } from '@/core/evaluations/entities/evaluation.entity';
import { EvaluationCourseInscription } from '@/core/evaluations/entities/evaluation-course-inscription.entity';
import {
  calculateFinalGrade,
  EvaluationForCalculation,
  CourtForCalculation,
  LapseForCalculation,
  StudentQualificationsForCalculation,
} from '@/core/evaluations';

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
        s.id AS "studentId",
        p.name AS "name",
        p."lastName" AS "lastName",
        p.dni AS "dni",
        ci."endQualification" AS "endQualification"
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
      id: student.studentId,
      name: student.name,
      lastName: student.lastName,
      dni: student.dni,
      endQualification: student.endQualification,
    }));
  }

  /**
   * Obtiene los detalles de las calificaciones de un estudiante específico en un curso-año escolar
   * @param courseSchoolYearId ID del curso-año escolar
   * @param studentId ID del estudiante
   * @returns Detalles completos de las calificaciones del estudiante
   */
  async getStudentQualificationsDetail(
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
        s.id AS "studentId",
        p.name AS "name",
        p."lastName" AS "lastName", 
        p.dni AS "dni",
        ci."endQualification" AS "endQualification",
        ci.id AS "courseInscriptionId"
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
    const courseInscriptionId = student.courseInscriptionId;

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
        const evaluationGrade =
          await this.evaluationCourseInscriptionRepository.findOne({
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
      }),
    );

    // Construir la respuesta completa
    const response: StudentGradesDetailResponseDto = {
      studentId: student.studentId,
      studentName: student.name,
      studentLastName: student.lastName,
      studentDni: student.dni,
      finalGrade: student.endQualification,
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
  async updateStudentQualifications(
    courseSchoolYearId: number,
    studentId: number,
    updateDto: UpdateStudentQualificationsDto,
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
        ci.id AS "courseInscriptionId"
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

    const courseInscriptionId = studentResult[0].courseInscriptionId;

    // Verificar que todas las evaluaciones pertenecen al curso
    const evaluationIds = updateDto.evaluations.map((e) => e.evaluationId);
    const evaluations = await this.evaluationRepository.find({
      where: {
        id: In(evaluationIds),
        courseSchoolYearId,
        deletedAt: null,
      },
    });

    if (evaluations.length !== evaluationIds.length) {
      throw new BadRequestException(
        'Una o más evaluaciones no existen o no pertenecen al curso especificado',
      );
    }

    // Obtener las calificaciones existentes para este estudiante
    const existingGrades =
      await this.evaluationCourseInscriptionRepository.find({
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
          existingGrade.qualificationDate =
            evaluationUpdate.qualification !== null &&
            evaluationUpdate.qualification !== undefined
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
            qualificationDate:
              evaluationUpdate.qualification !== null &&
              evaluationUpdate.qualification !== undefined
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

    // Calcular y actualizar la nota final del estudiante
    await this.updateStudentFinalGrade(courseInscriptionId, courseSchoolYearId);

    return {
      message: 'Calificaciones procesadas correctamente',
      results,
    };
  }

  /**
   * Actualiza únicamente la calificación final de un estudiante en una materia
   * @param courseSchoolYearId ID del curso-año escolar
   * @param studentId ID del estudiante
   * @param updateDto DTO con la nueva calificación final
   * @returns Confirmación de la operación
   */
  async updateStudentFinalQualification(
    courseSchoolYearId: number,
    studentId: number,
    updateDto: UpdateFinalQualificationDto,
  ): Promise<{ message: string }> {
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
        ci.id AS "courseInscriptionId"
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

    const courseInscriptionId = studentResult[0].courseInscriptionId;

    // Actualizar la calificación final directamente
    await this.courseInscriptionRepository.update(courseInscriptionId, {
      endQualification: updateDto.finalQualification,
    });

    return {
      message: 'Calificación final actualizada correctamente',
    };
  }

  /**
   * Calcula y actualiza la nota final de un estudiante basado en todas sus evaluaciones
   * @param courseInscriptionId ID de la inscripción del curso
   * @param courseSchoolYearId ID del curso-año escolar
   */
  private async updateStudentFinalGrade(
    courseInscriptionId: number,
    courseSchoolYearId: number,
  ): Promise<void> {
    // Obtener todas las evaluaciones del curso con sus calificaciones para el estudiante
    const evaluationsQuery = `
      SELECT 
        e.id as "evaluationId",
        e.percentage,
        e.correlative,
        sc.id as "courtId",
        sl."lapseNumber" as "lapseNumber",
        eci.qualification,
        eci."didNotPresent"
      FROM 
        evaluations e
      INNER JOIN 
        school_courts sc ON e."schoolCourtId" = sc.id
      INNER JOIN 
        school_lapses sl ON sc."schoolLapseId" = sl.id
      LEFT JOIN 
        evaluations_course_inscriptions eci ON eci."evaluationId" = e.id AND eci."courseInscriptionId" = $1
      WHERE 
        e."courseSchoolYearId" = $2
        AND e."deletedAt" IS NULL
      ORDER BY 
        sl."lapseNumber" ASC, 
        sc.id ASC, 
        e.correlative ASC
    `;

    const evaluationsData = await this.evaluationRepository.query(
      evaluationsQuery,
      [courseInscriptionId, courseSchoolYearId],
    );

    if (!evaluationsData || evaluationsData.length === 0) {
      // No hay evaluaciones, no calculamos nota final
      return;
    }

    // Organizar evaluaciones por lapsos y cortes
    const lapseMap = new Map<number, Map<number, EvaluationForCalculation[]>>();

    evaluationsData.forEach((evalData: any) => {
      const lapseNumber = evalData.lapseNumber;
      const courtId = evalData.courtId;

      const evaluation: EvaluationForCalculation = {
        evaluationId: evalData.evaluationId,
        percentage: parseFloat(evalData.percentage),
        qualification: evalData.qualification
          ? parseFloat(evalData.qualification)
          : null,
        didNotPresent: evalData.didNotPresent || false,
      };

      if (!lapseMap.has(lapseNumber)) {
        lapseMap.set(lapseNumber, new Map());
      }

      if (!lapseMap.get(lapseNumber).has(courtId)) {
        lapseMap.get(lapseNumber).set(courtId, []);
      }

      lapseMap.get(lapseNumber).get(courtId).push(evaluation);
    });

    // Convertir a la estructura del algoritmo
    const lapses: LapseForCalculation[] = Array.from(lapseMap.entries()).map(
      ([lapseNumber, courtMap]) => {
        const courts: CourtForCalculation[] = Array.from(
          courtMap.entries(),
        ).map(([courtId, evaluations]) => ({
          courtId,
          evaluations,
        }));

        return {
          lapseNumber,
          courts,
        };
      },
    );

    const studentData: StudentQualificationsForCalculation = {
      lapses,
    };

    // Calcular la nota final
    const finalGradeResult = calculateFinalGrade(studentData);

    // Actualizar la nota final en course_inscriptions
    if (finalGradeResult.finalGrade !== null) {
      await this.courseInscriptionRepository.update(courseInscriptionId, {
        endQualification: finalGradeResult.finalGrade,
      });
    }
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
