import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { Evaluation } from '../entities/evaluation.entity';
import { EvaluationDto } from '../dto/evaluation.dto';
import { SchoolCourt } from '../../school-year/entities/school-court.entity';
import { CourseSchoolYear } from '../../school-year/entities/course-school-year.entity';
import { EvaluationWithStudentsResponseDto } from '../dto/student-evaluation-qualification.dto';
import { BulkUpdateQualificationsDto, UpdateQualificationDto } from '../dto/update-qualification.dto';
import { FindStudentsByEvaluationAction } from './actions/find-students-by-evaluation.action';
import { UpdateStudentsQualificationsAction } from './actions/update-students-qualifications.action';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(SchoolCourt)
    private readonly schoolCourtRepository: Repository<SchoolCourt>,
    @InjectRepository(CourseSchoolYear)
    private readonly courseSchoolYearRepository: Repository<CourseSchoolYear>,
    private readonly findStudentsByEvaluationAction: FindStudentsByEvaluationAction,
    private readonly updateStudentsQualificationsAction: UpdateStudentsQualificationsAction,
  ) {}

  /**
   * Obtiene todas las evaluaciones, con opción de filtrado y paginación
   */
  async findAll(
    page = 1,
    perPage = 10,
    searchTerm?: string,
    courseSchoolYearId?: number,
    schoolCourtId?: number,
  ) {
    const options: FindManyOptions<Evaluation> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: ['courseSchoolYear', 'schoolCourt'],
      order: { creationDate: 'DESC' },
    };

    // Agregar where si se proporcionan filtros
    if (searchTerm || courseSchoolYearId || schoolCourtId) {
      options.where = {};

      if (searchTerm) {
        options.where.name = ILike(`%${searchTerm}%`);
      }

      if (courseSchoolYearId) {
        options.where.courseSchoolYearId = courseSchoolYearId;
      }

      if (schoolCourtId) {
        options.where.schoolCourtId = schoolCourtId;
      }
    }

    const [items, totalItems] =
      await this.evaluationRepository.findAndCount(options);

    return {
      items,
      paginate: {
        totalItems,
        page,
        perPage,
        totalPages: Math.ceil(totalItems / perPage),
      },
    };
  }

  /**
   * Busca una evaluación por ID
   */
  async findOne(id: number) {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['courseSchoolYear', 'schoolCourt', 'schoolCourt.schoolLapse'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    return evaluation;
  }

  /**
   * Obtiene todas las evaluaciones asociadas a un curso-año escolar
   */
  async findByCourseSchoolYear(courseSchoolYearId: number) {
    // Verificar que el course school year existe
    const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
      where: { id: courseSchoolYearId },
    });

    if (!courseSchoolYear) {
      throw new NotFoundException(
        `Curso-año escolar con ID ${courseSchoolYearId} no encontrado`,
      );
    }

    // Buscar evaluaciones por curso-año escolar
    const evaluations = await this.evaluationRepository.find({
      where: { courseSchoolYearId },
      relations: ['schoolCourt'],
      order: {
        schoolCourt: { schoolLapse: { lapseNumber: 'ASC' } },
        correlative: 'ASC',
      },
    });

    return evaluations;
  }

  /**
   * Obtiene los estudiantes de un curso con sus calificaciones para una evaluación específica
   * @param evaluationId ID de la evaluación
   * @returns Lista de estudiantes con sus calificaciones
   */
  async findStudentsByEvaluation(
    evaluationId: number,
  ): Promise<EvaluationWithStudentsResponseDto> {
    return this.findStudentsByEvaluationAction.execute(evaluationId);
  }

  /**
   * Crea una nueva evaluación
   */
  async create(evaluationDto: EvaluationDto) {
    // Verificar que el curso-año escolar existe
    const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
      where: { id: evaluationDto.courseSchoolYearId },
    });

    if (!courseSchoolYear) {
      throw new NotFoundException(
        `Curso-año escolar con ID ${evaluationDto.courseSchoolYearId} no encontrado`,
      );
    }

    // Verificar que el corte escolar existe
    const schoolCourt = await this.schoolCourtRepository.findOne({
      where: { id: evaluationDto.schoolCourtId },
      relations: ['schoolLapse'],
    });

    if (!schoolCourt) {
      throw new NotFoundException(
        `Corte escolar con ID ${evaluationDto.schoolCourtId} no encontrado`,
      );
    }

    // Validar que el porcentaje sea válido
    if (evaluationDto.percentage < 0 || evaluationDto.percentage > 100) {
      throw new BadRequestException('El porcentaje debe estar entre 0 y 100');
    }

    // Crear la evaluación
    const evaluation = this.evaluationRepository.create(evaluationDto);
    return this.evaluationRepository.save(evaluation);
  }

  /**
   * Actualiza una evaluación existente
   */
  async update(id: number, evaluationDto: EvaluationDto) {
    // Verificar que la evaluación existe
    await this.findOne(id);

    // Si se proporciona un courseSchoolYearId, verificar que existe
    if (evaluationDto.courseSchoolYearId) {
      const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
        where: { id: evaluationDto.courseSchoolYearId },
      });

      if (!courseSchoolYear) {
        throw new NotFoundException(
          `Curso-año escolar con ID ${evaluationDto.courseSchoolYearId} no encontrado`,
        );
      }
    }

    // Si se proporciona un schoolCourtId, verificar que existe
    if (evaluationDto.schoolCourtId) {
      const schoolCourt = await this.schoolCourtRepository.findOne({
        where: { id: evaluationDto.schoolCourtId },
      });

      if (!schoolCourt) {
        throw new NotFoundException(
          `Corte escolar con ID ${evaluationDto.schoolCourtId} no encontrado`,
        );
      }
    }

    // Validar que el porcentaje sea válido (si se proporciona)
    if (
      evaluationDto.percentage !== undefined &&
      (evaluationDto.percentage < 0 || evaluationDto.percentage > 100)
    ) {
      throw new BadRequestException('El porcentaje debe estar entre 0 y 100');
    }

    // Actualizar la evaluación
    await this.evaluationRepository.update(id, evaluationDto);

    // Devolver la evaluación actualizada
    return this.findOne(id);
  }

  /**
   * Elimina una evaluación
   */
  async remove(id: number) {
    // Verificar que la evaluación existe
    const evaluation = await this.findOne(id);

    // Soft delete (marcado como eliminado)
    await this.evaluationRepository.softDelete(id);

    return { message: `Evaluación ${evaluation.name} eliminada correctamente` };
  }

  /**
   * Actualiza las calificaciones de múltiples estudiantes para una evaluación específica
   * @param evaluationId ID de la evaluación
   * @param bulkUpdateDto DTO con las calificaciones a actualizar
   * @returns Información sobre las calificaciones actualizadas
   */
  async updateStudentsQualifications(
    evaluationId: number,
    bulkUpdateDto: BulkUpdateQualificationsDto,
  ) {
    return this.updateStudentsQualificationsAction.execute(evaluationId, bulkUpdateDto);
  }

  /**
   * Actualiza la calificación de un estudiante en una evaluación
   * @param evaluationId ID de la evaluación
   * @param updateDto Datos de la calificación a actualizar
   * @returns Información sobre la calificación actualizada
   */
  async updateStudentQualification(
    evaluationId: number,
    updateDto: UpdateQualificationDto,
  ) {
    return this.updateStudentsQualificationsAction.executeForSingleStudent(evaluationId, updateDto);
  }
}
