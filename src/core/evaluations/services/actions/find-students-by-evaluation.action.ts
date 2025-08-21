import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from '../../entities/evaluation.entity';
import { CourseInscription } from '../../../inscriptions/entities/course-inscription.entity';
import {
  EvaluationWithStudentsResponseDto,
  StudentEvaluationQualificationDto,
} from '../../dto/student-evaluation-qualification.dto';

/**
 * Acción para obtener los estudiantes y sus calificaciones para una evaluación específica
 */
@Injectable()
export class FindStudentsByEvaluationAction {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(CourseInscription)
    private readonly courseInscriptionRepository: Repository<CourseInscription>,
  ) {}

  /**
   * Obtiene los estudiantes de un curso con sus calificaciones para una evaluación específica
   * @param evaluationId ID de la evaluación
   * @returns Lista de estudiantes con sus calificaciones
   */
  async execute(
    evaluationId: number,
  ): Promise<EvaluationWithStudentsResponseDto> {
    // Verificar que la evaluación existe y obtener sus datos
    const evaluation = await this.evaluationRepository.findOne({
      where: { id: evaluationId },
      relations: ['courseSchoolYear', 'schoolCourt', 'schoolCourt.schoolLapse'],
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Evaluación con ID ${evaluationId} no encontrada`,
      );
    }

    // Obtener todas las inscripciones de curso con sus calificaciones (si existen)
    const query = `
      SELECT 
        ci.id as courseInscriptionId,
        s.id as studentId,
        p.name as name,
        p."lastName" as lastName,
        p.dni as dni,
        eci.id as evaluationCourseInscriptionId,
        eci.qualification as qualification,
        eci."qualificationDate" as qualificationDate,
        eci."didNotPresent" as didNotPresent
      FROM 
        course_inscriptions ci
      INNER JOIN 
        inscriptions i ON ci."inscriptionId" = i.id
      INNER JOIN 
        students s ON i."studentId" = s.id
      INNER JOIN 
        people p ON s.id = p.id
      LEFT JOIN 
        evaluations_course_inscriptions eci ON eci."courseInscriptionId" = ci.id AND eci."evaluationId" = $1
      WHERE 
        ci."courseSchoolYearId" = $2
        AND ci."deletedAt" IS NULL
        AND i."deletedAt" IS NULL
      ORDER BY
        p."lastName" ASC, p.name ASC
    `;

    const studentsWithQualifications =
      await this.courseInscriptionRepository.query(query, [
        evaluationId,
        evaluation.courseSchoolYearId,
      ]);

    if (!studentsWithQualifications.length) {
      // Si no hay inscripciones, devolvemos la evaluación con un array vacío de estudiantes
      const response = new EvaluationWithStudentsResponseDto();
      Object.assign(response, evaluation);
      response.students = [];
      return response;
    }

    // Mapear los datos de los estudiantes con sus calificaciones
    const students: StudentEvaluationQualificationDto[] =
      studentsWithQualifications.map((student) => {
        return {
          id: student.studentid,
          name: student.name,
          lastName: student.lastname,
          dni: student.dni,
          courseInscriptionId: student.courseinscriptionid,
          qualification: student.qualification,
          qualificationDate: student.qualificationdate,
          didNotPresent: student.didnotpresent || false,
          evaluationCourseInscriptionId: student.evaluationcourseinscriptionid,
        };
      });

    // Construir y devolver la respuesta
    const response = new EvaluationWithStudentsResponseDto();
    Object.assign(response, evaluation);
    response.students = students;

    return response;
  }
}
