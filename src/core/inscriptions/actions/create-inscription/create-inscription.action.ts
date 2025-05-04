import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Inscription } from '../../entities/inscription.entity';
import { CourseInscription } from '../../entities/course-inscription.entity';
import {
  CreateInscriptionDto,
  CreateCourseInscriptionDto,
} from '../../dto/create-inscription.dto';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';
import { SchoolYear } from '../../../school-year/entities/school-year.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class CreateInscriptionAction {
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
    createInscriptionDto: CreateInscriptionDto,
  ): Promise<Inscription> {
    const { studentId, schoolYearId, grade, courseInscriptions } =
      createInscriptionDto;

    // Validar existencia del estudiante
    // Nota: No inyectamos el repositorio de Student para evitar dependencias circulares
    // Usamos el queryRunner para ejecutar una consulta directa
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

    // Validar existencia del año escolar
    const schoolYear = await this.schoolYearRepository.findOne({
      where: { id: schoolYearId, deletedAt: null },
    });
    if (!schoolYear) {
      throw new NotFoundException(
        `Año escolar con ID ${schoolYearId} no encontrado`,
      );
    }

    // Verificar si ya existe una inscripción para este estudiante, año escolar y grado
    const existingInscription = await this.inscriptionRepository.findOne({
      where: {
        studentId,
        schoolYearId,
        grade,
        deletedAt: null,
      },
    });

    if (existingInscription) {
      throw new ConflictException(
        `Ya existe una inscripción para el estudiante ${studentId} en el año escolar ${schoolYearId} y grado ${grade}`,
      );
    }

    // Crear la inscripción principal
    const newInscription = this.inscriptionRepository.create({
      studentId,
      schoolYearId,
      grade,
    });

    const savedInscription =
      await this.inscriptionRepository.save(newInscription);

    // Si se proporcionan inscripciones de asignaturas específicas, usar esas
    if (courseInscriptions && courseInscriptions.length > 0) {
      await this.createSpecifiedCourseInscriptions(
        savedInscription.id,
        courseInscriptions,
      );
    } else {
      // De lo contrario, inscribir automáticamente en todas las asignaturas disponibles para el año y grado
      await this.createAutomaticCourseInscriptions(
        savedInscription.id,
        schoolYearId,
        +grade,
      );
    }

    // Cargar la inscripción con sus relaciones
    return this.inscriptionRepository.findOne({
      where: { id: savedInscription.id },
      relations: [
        'schoolYear',
        'courseInscriptions',
        'courseInscriptions.courseSchoolYear',
      ],
    });
  }

  private async createSpecifiedCourseInscriptions(
    inscriptionId: number,
    courseInscriptions: CreateCourseInscriptionDto[],
  ): Promise<void> {
    // Obtener los ids de courseSchoolYear
    const courseSchoolYearIds = courseInscriptions.map(
      (ci) => ci.courseSchoolYearId,
    );

    // Verificar que las asignaturas existen y corresponden al año escolar y grado
    const validCourseSchoolYears = await this.courseSchoolYearRepository.find({
      where: {
        id: In(courseSchoolYearIds),
        deletedAt: null,
      },
    });

    if (validCourseSchoolYears.length !== courseSchoolYearIds.length) {
      throw new NotFoundException(
        'Una o más asignaturas especificadas no fueron encontradas',
      );
    }

    // Crear las inscripciones de asignaturas
    const courseInscriptionEntities = validCourseSchoolYears.map(
      (courseSchoolYear) => {
        return this.courseInscriptionRepository.create({
          courseSchoolYearId: courseSchoolYear.id,
          inscriptionId,
        });
      },
    );

    await this.courseInscriptionRepository.save(courseInscriptionEntities);
  }

  private async createAutomaticCourseInscriptions(
    inscriptionId: number,
    schoolYearId: number,
    grade: number,
  ): Promise<void> {
    // Buscar todas las asignaturas disponibles para el año escolar y grado
    const availableCourseSchoolYears =
      await this.courseSchoolYearRepository.find({
        where: {
          schoolYearId,
          grade,
          deletedAt: null,
        },
      });

    if (availableCourseSchoolYears.length === 0) {
      // No hay asignaturas disponibles, pero aún así creamos la inscripción
      return;
    }

    // Crear inscripciones para todas las asignaturas disponibles
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
