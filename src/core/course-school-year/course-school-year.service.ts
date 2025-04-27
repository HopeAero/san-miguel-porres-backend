import { Injectable } from '@nestjs/common';
import { PaginateCourseSchoolYearAction } from './actions/paginate-course-school-year/paginate-course-school-year.action';
import { FindCourseSchoolYearAction } from './actions/find-course-school-year/find-course-school-year.action';
import { CreateCourseSchoolYearAction } from './actions/create-course-school-year/create-course-school-year.action';
import { UpdateCourseSchoolYearAction } from './actions/update-course-school-year/update-course-school-year.action';
import { RemoveCourseSchoolYearAction } from './actions/remove-course-school-year/remove-course-school-year.action';
import { PageDto } from '@/common/dto/page.dto';
import { CreateCourseSchoolYearDto } from './dto/create-course-school-year.dto';
import { UpdateCourseSchoolYearDto } from './dto/update-course-school-year.dto';
import { CourseSchoolYearResponseDto } from './dto/course-school-year-response.dto';
import { PaginateCourseSchoolYearDto, CourseSchoolYearPaginateResponseDto } from './dto/paginate-course-school-year.dto';

@Injectable()
export class CourseSchoolYearService {
  constructor(
    private readonly paginateCourseSchoolYearAction: PaginateCourseSchoolYearAction,
    private readonly findCourseSchoolYearAction: FindCourseSchoolYearAction,
    private readonly createCourseSchoolYearAction: CreateCourseSchoolYearAction,
    private readonly updateCourseSchoolYearAction: UpdateCourseSchoolYearAction,
    private readonly removeCourseSchoolYearAction: RemoveCourseSchoolYearAction,
  ) {}

  /**
   * Pagina y filtra asignaturas por año escolar
   * @param options Opciones de paginación y filtrado
   * @returns Datos paginados de asignaturas por año escolar
   */
  async paginate(options: PaginateCourseSchoolYearDto): Promise<PageDto<CourseSchoolYearPaginateResponseDto>> {
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
  async create(dto: CreateCourseSchoolYearDto): Promise<CourseSchoolYearResponseDto> {
    return this.createCourseSchoolYearAction.execute(dto);
  }

  /**
   * Actualiza una asignatura por año escolar existente
   * @param id ID de la asignatura por año escolar a actualizar
   * @param dto Datos para actualizar la asignatura por año escolar
   * @returns Datos de la asignatura por año escolar actualizada
   */
  async update(id: number, dto: UpdateCourseSchoolYearDto): Promise<CourseSchoolYearResponseDto> {
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