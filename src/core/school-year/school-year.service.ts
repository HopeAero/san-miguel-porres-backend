import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolYear } from './entities/school-year.entity';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { PageOptionsDto } from '../../common/dto/page.option.dto';
import { PageDto } from '../../common/dto/page.dto';
import { CreateCrudSchoolYearDto } from './dto/create-crud-school-year.dto';
import { Transactional } from 'typeorm-transactional';
// Las acciones necesitan estas entidades, pero no se usan directamente en el servicio
// Importaciones eliminadas: SchoolLapse y CourseSchoolYear
import {
  CreateSchoolYearAction,
  RemoveSchoolYearAction,
  UpdateSchoolYearAction,
} from './actions';
import {
  SchoolYearDetailsDto,
  SchoolLapseDetailsDto,
  CourseSchoolYearDetailsDto,
} from './dto/school-year-details.dto';

@Injectable()
export class SchoolYearService {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
    // Repositorios no utilizados - comentados para evitar advertencias de TypeScript
    // @InjectRepository(SchoolLapse)
    // private schoolLapseRepository: Repository<SchoolLapse>,
    // @InjectRepository(CourseSchoolYear)
    // private courseSchoolYearRepository: Repository<CourseSchoolYear>,
    private createSchoolYearAction: CreateSchoolYearAction,
    private updateSchoolYearAction: UpdateSchoolYearAction,
    private removeSchoolYearAction: RemoveSchoolYearAction,
  ) {}

  @Transactional()
  async create(
    createCrudSchoolYearDto: CreateCrudSchoolYearDto,
  ): Promise<SchoolYear> {
    return this.createSchoolYearAction.execute(createCrudSchoolYearDto);
  }

  // Método específico para componentes de selección
  async findAll(searchTerm: string = ''): Promise<SchoolYear[]> {
    try {
      const query = this.schoolYearRepository
        .createQueryBuilder('schoolYear')
        .select(['schoolYear.id', 'schoolYear.code'])
        .where('schoolYear.deletedAt IS NULL');

      // Si hay término de búsqueda, filtrar por código asegurando que sea seguro
      if (searchTerm && searchTerm.trim()) {
        // Eliminar caracteres especiales para evitar inyección SQL o problemas de conversión
        const safeSearchTerm = searchTerm.replace(/[^a-zA-Z0-9\s-]/g, '');

        if (safeSearchTerm) {
          query.andWhere('schoolYear.code LIKE :searchTerm', {
            searchTerm: `%${safeSearchTerm}%`,
          });
        }
      }

      // Ordenar por fecha de inicio descendente
      query.orderBy('schoolYear.startDate', 'DESC');

      const schoolYears = await query.getMany();

      return schoolYears;
    } catch (error) {
      console.error('Error al buscar años escolares para selector:', error);
      // Devolver un array vacío en caso de error para evitar que se rompa la aplicación
      return [];
    }
  }

  async update(
    id: number,
    updateSchoolYearDto: UpdateSchoolYearDto,
  ): Promise<SchoolYear> {
    return this.updateSchoolYearAction.execute(id, updateSchoolYearDto);
  }

  async findOne(id: number): Promise<SchoolYearDetailsDto> {
    const schoolYear = await this.schoolYearRepository.findOne({
      where: { id },
      relations: [
        'schoolLapses',
        'schoolLapses.schoolCourts',
        'courseSchoolYears',
        'courseSchoolYears.course',
        'courseSchoolYears.professor',
        'courseSchoolYears.professor.person',
      ],
    });

    if (!schoolYear) {
      throw new NotFoundException(`Año escolar con ID "${id}" no encontrado`);
    }

    // Transformar a DTO con contadores
    const lapsesCount = schoolYear.schoolLapses?.length || 0;
    const courtsCount =
      schoolYear.schoolLapses?.reduce(
        (sum, lapse) => sum + (lapse.schoolCourts?.length || 0),
        0,
      ) || 0;
    const coursesCount = schoolYear.courseSchoolYears?.length || 0;

    // Mapear los lapsos a SchoolLapseDetailsDto
    const schoolLapsesDto: SchoolLapseDetailsDto[] =
      schoolYear.schoolLapses?.map((lapse) => {
        return {
          id: Number(lapse.id),
          lapseNumber: lapse.lapseNumber,
          startDate: lapse.startDate,
          endDate: lapse.endDate,
          schoolCourts: lapse.schoolCourts?.map((court) => ({
            id: Number(court.id),
            courtNumber: court.courtNumber,
            startDate: court.startDate,
            endDate: court.endDate,
          })),
        };
      }) || [];

    // Mapear los cursos a CourseSchoolYearDetailsDto
    const courseSchoolYearsDto: CourseSchoolYearDetailsDto[] =
      schoolYear.courseSchoolYears?.map((course) => {
        return {
          id: course.id,
          grade: course.grade,
          weeklyHours: course.weeklyHours,
          professorId: course.professorId,
          courseId: course.courseId,
          course: course.course
            ? {
                id: course.course.id,
                name: course.course.name,
              }
            : undefined,
          professor: course.professor
            ? {
                id: course.professor.id,
                name: course.professor.person
                  ? `${course.professor.person.name} ${course.professor.person.lastName}`
                  : 'Sin nombre',
              }
            : undefined,
        };
      }) || [];

    // Transformar a DTO de detalle
    return {
      id: schoolYear.id,
      code: schoolYear.code,
      startDate: schoolYear.startDate,
      endDate: schoolYear.endDate,
      lapsesCount,
      courtsCount,
      coursesCount,
      schoolLapses: schoolLapsesDto,
      courseSchoolYears: courseSchoolYearsDto,
    };
  }

  async paginate(pageOptionsDto: PageOptionsDto): Promise<PageDto<SchoolYear>> {
    // Consulta para obtener el total de registros
    const totalQuery = this.schoolYearRepository
      .createQueryBuilder('schoolYear')
      .where('schoolYear.deletedAt IS NULL');

    const total = await totalQuery.getCount();

    // Consulta optimizada para obtener directamente los contadores paginados
    const schoolYearsWithCounts = await this.schoolYearRepository
      .createQueryBuilder('schoolYear')
      .leftJoin('schoolYear.schoolLapses', 'schoolLapse')
      .leftJoin('schoolLapse.schoolCourts', 'schoolCourt')
      .leftJoin('schoolYear.courseSchoolYears', 'courseSchoolYear')
      .select([
        'schoolYear.id',
        'schoolYear.code',
        'schoolYear.startDate',
        'schoolYear.endDate',
      ])
      .addSelect('COUNT(DISTINCT schoolLapse.id)', 'lapsesCount')
      .addSelect('COUNT(DISTINCT schoolCourt.id)', 'courtsCount')
      .addSelect('COUNT(DISTINCT courseSchoolYear.id)', 'coursesCount')
      .where('schoolYear.deletedAt IS NULL')
      .groupBy('schoolYear.id')
      .orderBy(`schoolYear.id`, pageOptionsDto.order)
      .take(pageOptionsDto.perPage)
      .skip(pageOptionsDto.skip)
      .getRawMany();

    // Transformar los resultados para que sean compatibles con SchoolYear
    const items = schoolYearsWithCounts.map((rawSchoolYear) => {
      return {
        id: rawSchoolYear.schoolYear_id,
        code: rawSchoolYear.schoolYear_code,
        startDate: rawSchoolYear.schoolYear_startDate,
        endDate: rawSchoolYear.schoolYear_endDate,
        lapsesCount: parseInt(rawSchoolYear.lapsesCount) || 0,
        courtsCount: parseInt(rawSchoolYear.courtsCount) || 0,
        coursesCount: parseInt(rawSchoolYear.coursesCount) || 0,
      } as any;
    });

    return new PageDto(items, total, pageOptionsDto);
  }

  async remove(id: number): Promise<void> {
    return this.removeSchoolYearAction.execute(id);
  }
}
