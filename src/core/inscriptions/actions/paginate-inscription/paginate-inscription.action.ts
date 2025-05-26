import { Injectable, Logger } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inscription } from '../../entities/inscription.entity';
import {
  PaginateInscriptionDto,
  PaginateInscriptionResponseDto,
} from '../../dto/paginate-inscription.dto';
import { PageDto } from '@/common/dto/page.dto';
import { InscriptionResponseDto } from '../../dto/inscription.dto';
import { CourseInscriptionResponseDto } from '../../dto/course-inscription.dto';
import { Order } from '@/common/constants/order.constant';

@Injectable()
export class PaginateInscriptionAction {
  private readonly logger = new Logger(PaginateInscriptionAction.name);

  constructor(
    @InjectRepository(Inscription)
    private readonly inscriptionRepository: Repository<Inscription>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    dto: PaginateInscriptionDto,
  ): Promise<PaginateInscriptionResponseDto> {
    const queryBuilder = this.inscriptionRepository
      .createQueryBuilder('inscription')
      .leftJoinAndSelect('inscription.schoolYear', 'schoolYear')
      .leftJoinAndSelect('inscription.courseInscriptions', 'courseInscriptions')
      .leftJoinAndSelect(
        'courseInscriptions.courseSchoolYear',
        'courseSchoolYear',
      )
      .leftJoinAndSelect('courseSchoolYear.course', 'course')
      .where('inscription.deletedAt IS NULL');

    // Filtrar por año escolar si se proporciona
    if (dto.schoolYearId) {
      queryBuilder.andWhere('inscription.schoolYearId = :schoolYearId', {
        schoolYearId: dto.schoolYearId,
      });
    }

    // Filtrar por grado si se proporciona
    if (dto.gradeFilter) {
      queryBuilder.andWhere('inscription.grade = :grade', {
        grade: dto.gradeFilter,
      });
    }

    // Buscar por nombre de estudiante, cédula o datos del representante
    if (dto.search) {
      queryBuilder.andWhere(
        `
        inscription.studentId IN (
          SELECT s.id
          FROM public.students AS s
          JOIN people sp ON s.id = sp.id
          LEFT JOIN representatives r ON s."representativeId" = r.id
          LEFT JOIN people rp ON r.id = rp.id
          WHERE (
            sp.name ILIKE :search OR 
            sp."lastName" ILIKE :search OR 
            sp.dni ILIKE :search OR
            rp.name ILIKE :search OR 
            rp."lastName" ILIKE :search OR
            rp.dni ILIKE :search
          )
          AND s."deletedAt" IS NULL
        )
      `,
        { search: `%${dto.search}%` },
      );
    }

    // Aplicar ordenamiento
    if (dto.order === Order.ASC) {
      queryBuilder.orderBy('inscription.id', 'ASC');
    } else {
      queryBuilder.orderBy('inscription.id', 'DESC');
    }

    // Aplicar paginación
    queryBuilder.skip(dto.skip);
    queryBuilder.take(dto.perPage);

    // Ejecutar la consulta para obtener las inscripciones paginadas
    const [inscriptions, totalCount] = await queryBuilder.getManyAndCount();

    // Si no hay inscripciones, devolver página vacía
    if (inscriptions.length === 0) {
      return new PageDto([], 0, dto) as PaginateInscriptionResponseDto;
    }

    // Obtener los IDs de los estudiantes para buscar su información
    const studentIds = inscriptions.map((inscription) => inscription.studentId);

    // Usar SQL nativo para obtener los datos de estudiantes relacionados y sus representantes
    const studentsWithRepresentatives = await this.dataSource.query(`
      SELECT 
        s.id, 
        sp.name, 
        sp."lastName", 
        sp.dni,
        r.id as "representativeId",
        rp.name as "representativeName",
        rp."lastName" as "representativeLastName",
        rp.dni as "representativeDni"
      FROM students s
      JOIN people sp ON s.id = sp.id
      LEFT JOIN representatives r ON s."representativeId" = r.id
      LEFT JOIN people rp ON r.id = rp.id
      WHERE s.id IN (${studentIds.length > 0 ? studentIds.join(',') : 0})
      AND s."deletedAt" IS NULL
    `);

    // Log para verificar si hay datos de representantes
    this.logger.debug(
      `Encontrados ${studentsWithRepresentatives.length} estudiantes`,
    );
    this.logger.debug(
      `Datos de representantes: ${JSON.stringify(
        studentsWithRepresentatives.map((s) => ({
          studentId: s.id,
          hasRepresentative: !!s.representativeId,
          representativeId: s.representativeId,
        })),
      )}`,
    );

    // Mapear las inscripciones con los datos de estudiantes y representantes
    const items = inscriptions.map((inscription) => {
      const studentInfo = studentsWithRepresentatives.find(
        (s) => s.id === inscription.studentId,
      );
      return this.mapToResponseDto(inscription, studentInfo);
    });

    // Devolver el DTO de respuesta paginada
    return new PageDto(
      items,
      totalCount,
      dto,
    ) as PaginateInscriptionResponseDto;
  }

  private mapToResponseDto(
    inscription: Inscription,
    studentInfo:
      | {
          id: number;
          name: string;
          lastName: string;
          dni: string;
          representativeId: number;
          representativeName: string;
          representativeLastName: string;
          representativeDni: string;
        }
      | undefined,
  ): InscriptionResponseDto {
    const responseDto = new InscriptionResponseDto();

    responseDto.id = inscription.id;
    responseDto.studentId = inscription.studentId;
    responseDto.schoolYearId = inscription.schoolYearId;
    responseDto.grade = inscription.grade;

    // Información del año escolar
    if (inscription.schoolYear) {
      responseDto.schoolYear = {
        id: inscription.schoolYear.id,
        code: inscription.schoolYear.code,
      };
    }

    // Información del estudiante
    if (studentInfo) {
      responseDto.student = {
        id: studentInfo.id,
        name: studentInfo.name,
        lastName: studentInfo.lastName,
        dni: studentInfo.dni,
      };

      // Información del representante
      if (studentInfo.representativeId) {
        responseDto.representative = {
          id: studentInfo.representativeId,
          name: studentInfo.representativeName,
          lastName: studentInfo.representativeLastName,
          dni: studentInfo.representativeDni,
          fullInfo: `${studentInfo.representativeName} ${studentInfo.representativeLastName} (${studentInfo.representativeDni})`,
        };
      }
    }

    // Mapear inscripciones de cursos
    if (inscription.courseInscriptions) {
      responseDto.courseInscriptions = [];

      inscription.courseInscriptions.forEach((ci) => {
        const courseInscriptionDto = new CourseInscriptionResponseDto();

        courseInscriptionDto.id = ci.id;
        courseInscriptionDto.courseSchoolYearId = ci.courseSchoolYearId;
        courseInscriptionDto.inscriptionId = ci.inscriptionId;
        courseInscriptionDto.endQualification = ci.endQualification;
        courseInscriptionDto.attemptNumber = ci.attemptNumber;
        courseInscriptionDto.attemptType = ci.attemptType;

        if (ci.courseSchoolYear) {
          courseInscriptionDto.courseSchoolYear = {
            id: ci.courseSchoolYear.id,
            grade: ci.courseSchoolYear.grade,
            courseId: ci.courseSchoolYear.courseId,
            course: ci.courseSchoolYear.course
              ? {
                  id: ci.courseSchoolYear.course.id,
                  name: ci.courseSchoolYear.course.name,
                }
              : undefined,
          };
        }

        // Ya no creamos la información de inscription para evitar la referencia circular

        responseDto.courseInscriptions.push(courseInscriptionDto);
      });
    }

    return responseDto;
  }
}
