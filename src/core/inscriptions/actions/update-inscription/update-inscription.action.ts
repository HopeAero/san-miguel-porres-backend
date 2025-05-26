import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inscription } from '../../entities/inscription.entity';
import { CourseInscription } from '../../entities/course-inscription.entity';
import {
  UpdateInscriptionDto,
  UpdateCourseInscriptionDto,
} from '../../dto/update-inscription.dto';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';
import { SchoolYear } from '../../../school-year/entities/school-year.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UpdateInscriptionAction {
  constructor(
    @InjectRepository(Inscription)
    private inscriptionRepository: Repository<Inscription>,
    @InjectRepository(CourseInscription)
    private courseInscriptionRepository: Repository<CourseInscription>,
    @InjectRepository(CourseSchoolYear)
    private courseSchoolYearRepository: Repository<CourseSchoolYear>,
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
    private dataSource: DataSource,
  ) {}

  @Transactional()
  async execute(
    id: number,
    updateInscriptionDto: UpdateInscriptionDto,
  ): Promise<Inscription> {
    // Verificar que la inscripción existe
    const existingInscription = await this.inscriptionRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!existingInscription) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }

    // Extraer datos del DTO
    const { studentId, schoolYearId, grade, courseInscriptions } =
      updateInscriptionDto;

    // Si se actualiza el estudiante, validar que existe
    if (
      studentId !== undefined &&
      studentId !== existingInscription.studentId
    ) {
      const queryRunner = this.dataSource.createQueryRunner();
      try {
        await queryRunner.connect();
        const studentExists = await queryRunner.manager.query(
          'SELECT id FROM students WHERE id = $1 AND deleted_at IS NULL',
          [studentId],
        );

        if (!studentExists || studentExists.length === 0) {
          throw new NotFoundException(
            `Estudiante con ID ${studentId} no encontrado`,
          );
        }
      } finally {
        await queryRunner.release();
      }
    }

    // Si se actualiza el año escolar, validar que existe
    if (
      schoolYearId !== undefined &&
      schoolYearId !== existingInscription.schoolYearId
    ) {
      const schoolYear = await this.schoolYearRepository.findOne({
        where: { id: schoolYearId, deletedAt: null },
      });
      if (!schoolYear) {
        throw new NotFoundException(
          `Año escolar con ID ${schoolYearId} no encontrado`,
        );
      }
    }

    // Verificar si los nuevos datos no duplican otra inscripción
    if (
      (studentId !== undefined &&
        studentId !== existingInscription.studentId) ||
      (schoolYearId !== undefined &&
        schoolYearId !== existingInscription.schoolYearId) ||
      (grade !== undefined && grade !== existingInscription.grade)
    ) {
      const newStudentId =
        studentId === undefined ? existingInscription.studentId : studentId;
      const newSchoolYearId =
        schoolYearId === undefined
          ? existingInscription.schoolYearId
          : schoolYearId;
      const newGrade = grade === undefined ? existingInscription.grade : grade;

      const duplicateInscription = await this.inscriptionRepository.findOne({
        where: {
          studentId: newStudentId,
          schoolYearId: newSchoolYearId,
          grade: newGrade,
          deletedAt: null,
        },
      });

      if (duplicateInscription && duplicateInscription.id !== id) {
        throw new ConflictException(
          `Ya existe una inscripción para el estudiante ${newStudentId} en el año escolar ${newSchoolYearId} y grado ${newGrade}`,
        );
      }
    }

    // Actualizar la inscripción principal
    await this.inscriptionRepository.update(id, {
      studentId:
        studentId === undefined ? existingInscription.studentId : studentId,
      schoolYearId:
        schoolYearId === undefined
          ? existingInscription.schoolYearId
          : schoolYearId,
      grade: grade === undefined ? existingInscription.grade : grade,
    });

    // Gestionar inscripciones de asignaturas si se proporcionan
    if (courseInscriptions && courseInscriptions.length > 0) {
      await this.updateCourseInscriptions(id, courseInscriptions);
    }

    // Si cambió el año escolar o grado, puede ser necesario recalcular las inscripciones de asignaturas
    const yearOrGradeChanged =
      (schoolYearId !== undefined &&
        schoolYearId !== existingInscription.schoolYearId) ||
      (grade !== undefined && grade !== existingInscription.grade);

    if (
      yearOrGradeChanged &&
      (!courseInscriptions || courseInscriptions.length === 0)
    ) {
      // Si cambiaron el año o grado pero no se especificaron asignaturas,
      // eliminamos las inscripciones antiguas y creamos nuevas
      await this.recalculateCourseInscriptions(
        id,
        schoolYearId === undefined
          ? existingInscription.schoolYearId
          : schoolYearId,
        grade === undefined ? +existingInscription.grade : +grade,
      );
    }

    // Cargar la inscripción actualizada con sus relaciones
    return this.inscriptionRepository.findOne({
      where: { id },
      relations: [
        'schoolYear',
        'courseInscriptions',
        'courseInscriptions.courseSchoolYear',
      ],
    });
  }

  private async updateCourseInscriptions(
    inscriptionId: number,
    courseInscriptions: UpdateCourseInscriptionDto[],
  ): Promise<void> {
    // Obtener todas las inscripciones de asignaturas existentes
    const existingCourseInscriptions =
      await this.courseInscriptionRepository.find({
        where: { inscriptionId, deletedAt: null },
      });

    // Identificar IDs de inscripciones de asignaturas
    const existingIds = existingCourseInscriptions.map((ci) => ci.id);
    const incomingIds = courseInscriptions
      .filter((ci) => ci.id)
      .map((ci) => ci.id);

    // Eliminar las inscripciones que no están en la solicitud
    const idsToRemove = existingIds.filter((id) => !incomingIds.includes(id));
    if (idsToRemove.length > 0) {
      await Promise.all(
        idsToRemove.map((id) =>
          this.courseInscriptionRepository.softDelete(id),
        ),
      );
    }

    // Actualizar inscripciones existentes y crear nuevas
    for (const courseInscription of courseInscriptions) {
      if (courseInscription.id) {
        // Actualizar inscripción existente
        await this.courseInscriptionRepository.update(courseInscription.id, {
          courseSchoolYearId: courseInscription.courseSchoolYearId,
        });
      } else {
        // Verificar que la asignatura del año escolar existe
        const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
          where: { id: courseInscription.courseSchoolYearId, deletedAt: null },
        });

        if (!courseSchoolYear) {
          throw new NotFoundException(
            `Asignatura con ID ${courseInscription.courseSchoolYearId} no encontrada`,
          );
        }

        // Crear nueva inscripción de asignatura
        const newCourseInscription = this.courseInscriptionRepository.create({
          courseSchoolYearId: courseInscription.courseSchoolYearId,
          inscriptionId,
        });

        await this.courseInscriptionRepository.save(newCourseInscription);
      }
    }
  }

  private async recalculateCourseInscriptions(
    inscriptionId: number,
    schoolYearId: number,
    grade: number,
  ): Promise<void> {
    // Eliminar todas las inscripciones de asignaturas actuales
    await this.courseInscriptionRepository.softDelete({ inscriptionId });

    // Buscar las asignaturas disponibles para el nuevo año escolar y grado
    const availableCourseSchoolYears =
      await this.courseSchoolYearRepository.find({
        where: {
          schoolYearId,
          grade,
          deletedAt: null,
        },
      });

    if (availableCourseSchoolYears.length === 0) {
      // No hay asignaturas disponibles, dejamos la inscripción sin asignaturas
      return;
    }

    // Crear nuevas inscripciones para cada asignatura disponible
    const courseInscriptionEntities = availableCourseSchoolYears.map(
      (courseSchoolYear) => {
        return this.courseInscriptionRepository.create({
          courseSchoolYearId: courseSchoolYear.id,
          inscriptionId,
        });
      },
    );

    await this.courseInscriptionRepository.save(courseInscriptionEntities);
  }
}
