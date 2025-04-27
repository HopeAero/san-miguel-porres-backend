import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw, In } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { CourseDto } from './dto/course.dto';
import { plainToClass } from 'class-transformer';
import { PageDto } from '@/common/dto/page.dto';
import { CourseByGradeDto } from './dto/course-by-grade.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDto> {
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);
    return plainToClass(CourseDto, savedCourse);
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDto> {
    const course = await this.courseRepository.preload({
      id,
      ...updateCourseDto,
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    const updatedCourse = await this.courseRepository.save(course);
    return plainToClass(CourseDto, updatedCourse);
  }

  async findOne(id: number): Promise<CourseDto> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return plainToClass(CourseDto, course);
  }

  /**
   * Obtiene todos los cursos activos (no eliminados) sin paginación,
   * opcionalmente filtrados por grado, nombre y limitados en cantidad.
   * Este método es útil para construir selectores en el frontend.
   */
  async findAll(
    grade?: number | null,
    name?: string | null,
    limit?: number | null,
    forceItemsIds?: string | null,
  ): Promise<CourseByGradeDto[]> {
    // Crear la condición where base (solo considerar no eliminados)
    const whereCondition: any = {
      deletedAt: null, // Solo cursos no eliminados
    };

    // Si se especifica un grado y es un número válido, añadirlo a la condición
    if (grade !== undefined && grade !== null && !isNaN(Number(grade))) {
      whereCondition.grade = Number(grade);
    }

    // Si se especifica un nombre, añadirlo a la condición para búsqueda parcial
    if (name && name.trim()) {
      whereCondition.name = this.getILikeQuery(name);
    }

    // Opciones de consulta para el repositorio
    const findOptions: any = {
      where: whereCondition,
      order: {
        grade: 'ASC',
        name: 'ASC', // Ordenar primero por grado, luego por nombre
      },
      select: ['id', 'name', 'publicName', 'grade'], // Incluimos publicName en la selección
    };

    // Si se especifica un límite, añadirlo a las opciones
    if (limit !== undefined && limit !== null && !isNaN(Number(limit))) {
      findOptions.take = Number(limit);
    }

    // Buscar cursos que cumplan con las condiciones
    const courses = await this.courseRepository.find(findOptions);

    // Transformar a DTOs
    const result = courses.map((course) =>
      plainToClass(CourseByGradeDto, course),
    );

    return this.getResultWithForceItemsIds(result, forceItemsIds);
  }

  private async getResultWithForceItemsIds(
    result: CourseByGradeDto[],
    forceItemsIds: string | null,
  ): Promise<CourseByGradeDto[]> {
    // Si hay IDs forzados, buscarlos y añadirlos al resultado
    if (forceItemsIds && forceItemsIds.trim()) {
      // Separar los IDs y convertirlos a números
      const neededItemsIds = this.getNeededItemsIds(
        forceItemsIds,
        result.map((course) => course.id),
      );

      if (!neededItemsIds.length) return result;

      // Buscar los cursos por los IDs forzados, incluyendo eliminados
      const additionalCourses = await this.courseRepository.find({
        where: { id: In(neededItemsIds) },
        select: ['id', 'name', 'publicName', 'grade'],
        withDeleted: true, // Incluir entidades con soft delete
      });
      // Concatenar los resultados
      result = result.concat(additionalCourses);
    }

    return result;
  }

  private getNeededItemsIds(
    forceItemsIdsInput: string | null,
    currentCoursesIds: number[],
  ): number[] {
    if (!forceItemsIdsInput) return [];

    const forceItemsIds = forceItemsIdsInput
      .split(',')
      .map((id) => id.trim())
      .filter((id) => !isNaN(Number(id)))
      .map((id) => Number(id));

    return forceItemsIds.filter((id) => !currentCoursesIds.includes(id));
  }

  /**
   * Auxiliar para crear una búsqueda insensible a mayúsculas/minúsculas
   * adaptada al SGBD utilizado (PostgreSQL, MySQL, SQLite)
   */
  private getILikeQuery(text: string): any {
    // Para PostgreSQL usar ILike
    return Raw((alias) => `LOWER(${alias}) LIKE LOWER(:value)`, {
      value: `%${text}%`,
    });
  }

  async paginate(paginationDto: PageOptionsDto): Promise<PageDto<CourseDto>> {
    const [result, total] = await this.courseRepository.findAndCount({
      order: {
        id: paginationDto.order,
      },
      take: paginationDto.perPage,
      skip: paginationDto.skip,
    });

    const courses: CourseDto[] = result.map((entity: Course) => {
      return plainToClass(CourseDto, {
        ...entity,
        id: entity.id,
      });
    });

    return new PageDto(courses, total, paginationDto);
  }

  async remove(id: number): Promise<void> {
    const result = await this.courseRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
