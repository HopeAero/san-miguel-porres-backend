import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Evaluation } from '../../entities/evaluation.entity';
import { EvaluationCourseInscription } from '../../entities/evaluation-course-inscription.entity';
import { CourseInscription } from '../../../inscriptions/entities/course-inscription.entity';
import {
  BulkUpdateQualificationsDto,
  UpdateQualificationDto,
} from '../../dto/update-qualification.dto';

/**
 * Acción para actualizar las calificaciones de estudiantes en una evaluación
 */
@Injectable()
export class UpdateStudentsQualificationsAction {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationCourseInscription)
    private readonly evaluationCourseInscriptionRepository: Repository<EvaluationCourseInscription>,
    @InjectRepository(CourseInscription)
    private readonly courseInscriptionRepository: Repository<CourseInscription>,
  ) {}

  /**
   * Actualiza las calificaciones de múltiples estudiantes para una evaluación específica
   * @param evaluationId ID de la evaluación
   * @param bulkUpdateDto DTO con las calificaciones a actualizar
   * @returns Información sobre las calificaciones actualizadas
   */
  async execute(
    evaluationId: number,
    bulkUpdateDto: BulkUpdateQualificationsDto,
  ) {
    // Verificar que la evaluación existe
    const evaluation = await this.evaluationRepository.findOne({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Evaluación con ID ${evaluationId} no encontrada`,
      );
    }

    // Extraer los IDs de las inscripciones de curso
    const courseInscriptionIds = bulkUpdateDto.qualifications.map(
      (q) => q.courseInscriptionId,
    );

    // Verificar que todas las inscripciones de curso existen y pertenecen al mismo courseSchoolYear que la evaluación
    const courseInscriptions = await this.courseInscriptionRepository.find({
      where: {
        id: In(courseInscriptionIds),
        courseSchoolYearId: evaluation.courseSchoolYearId,
      },
    });

    if (courseInscriptions.length !== courseInscriptionIds.length) {
      throw new BadRequestException(
        'Una o más inscripciones de curso no existen o no pertenecen al curso-año escolar de la evaluación',
      );
    }

    // Obtener las calificaciones existentes para esta evaluación y las inscripciones dadas
    const existingQualifications =
      await this.evaluationCourseInscriptionRepository.find({
        where: {
          evaluationId,
          courseInscriptionId: In(courseInscriptionIds),
        },
      });

    // Crear un mapa para acceso rápido a las calificaciones existentes
    const qualificationsMap = new Map<number, EvaluationCourseInscription>();
    existingQualifications.forEach((q) => {
      qualificationsMap.set(q.courseInscriptionId, q);
    });

    // Procesar cada calificación
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
    };

    const today = new Date();

    // Guardar en transacción
    for (const qualificationDto of bulkUpdateDto.qualifications) {
      try {
        // Validar que la calificación esté en el rango correcto
        if (
          qualificationDto.qualification !== null &&
          qualificationDto.qualification !== undefined &&
          (qualificationDto.qualification < 0 || qualificationDto.qualification > 20)
        ) {
          console.error(
            `Calificación fuera de rango para courseInscriptionId ${qualificationDto.courseInscriptionId}: ${qualificationDto.qualification}`,
          );
          results.failed++;
          continue;
        }
        const existingQualification = qualificationsMap.get(
          qualificationDto.courseInscriptionId,
        );

        // Si ya existe una calificación para este estudiante y evaluación, actualizarla
        if (existingQualification) {
          // Validar si se intenta actualizar a "no presentó" y ya hay una calificación
          if (
            qualificationDto.didNotPresent &&
            existingQualification.qualification !== null
          ) {
            // Si tiene calificación y ahora quiere marcar como "no presentó",
            // establecer la calificación a null
            existingQualification.qualification = null;
          } else if (qualificationDto.qualification !== undefined) {
            // Si se proporciona una nueva calificación, actualizarla
            existingQualification.qualification =
              qualificationDto.qualification;
            // Si antes estaba marcado como "no presentó", quitarlo
            if (
              existingQualification.didNotPresent &&
              qualificationDto.qualification !== null
            ) {
              existingQualification.didNotPresent = false;
            }
          }

          // Actualizar el flag didNotPresent si se proporciona
          if (qualificationDto.didNotPresent !== undefined) {
            existingQualification.didNotPresent =
              qualificationDto.didNotPresent;
          }

          // Actualizar la fecha de calificación si se proporciona, o usar la fecha actual
          existingQualification.qualificationDate =
            qualificationDto.qualificationDate || today;

          await this.evaluationCourseInscriptionRepository.save(
            existingQualification,
          );
          results.updated++;
        } else {
          // Si no existe, crear una nueva calificación
          const newQualification =
            this.evaluationCourseInscriptionRepository.create({
              evaluationId,
              courseInscriptionId: qualificationDto.courseInscriptionId,
              qualification: qualificationDto.qualification || null,
              didNotPresent: qualificationDto.didNotPresent || false,
              qualificationDate: qualificationDto.qualificationDate || today,
            });

          await this.evaluationCourseInscriptionRepository.save(
            newQualification,
          );
          results.created++;
        }
      } catch (error) {
        console.error(
          `Error al actualizar calificación para courseInscriptionId ${qualificationDto.courseInscriptionId}:`,
          error,
        );
        results.failed++;
      }
    }

    return {
      message: 'Calificaciones actualizadas correctamente',
      results,
    };
  }

  /**
   * Actualiza la calificación de un estudiante en una evaluación
   * @param evaluationId ID de la evaluación
   * @param updateDto Datos de la calificación a actualizar
   * @returns Información sobre la calificación actualizada
   */
  async executeForSingleStudent(
    evaluationId: number,
    updateDto: UpdateQualificationDto,
  ) {
    // Utilizar el método bulk para actualizar una sola calificación
    const result = await this.execute(evaluationId, {
      qualifications: [updateDto],
    });

    return {
      message: 'Calificación actualizada correctamente',
      updated: result.results.updated > 0,
      created: result.results.created > 0,
    };
  }
}
