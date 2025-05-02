import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../entities/student.entity';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { StudentDto } from '../../dto/student';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PaginateStudentAction {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /**
   * Pagina y opcionalmente filtra la lista de estudiantes
   * @param paginationDto Opciones de paginación y búsqueda
   * @returns Objeto paginado con los estudiantes y metadatos de paginación
   */
  async execute(paginationDto: PageOptionsDto): Promise<PageDto<StudentDto>> {
    // Crear el query builder base
    let queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('student.representative', 'representative')
      .orderBy('student.id', paginationDto.order);

    // Aplicar filtro de búsqueda solo si searchTerm existe, no es null y no es una cadena vacía
    if (
      paginationDto.searchTerm !== undefined &&
      paginationDto.searchTerm !== null &&
      paginationDto.searchTerm.trim() !== ''
    ) {
      queryBuilder = queryBuilder.andWhere(
        '(person.name ILIKE :searchTerm OR person.lastName ILIKE :searchTerm OR person.dni ILIKE :searchTerm)',
        { searchTerm: `%${paginationDto.searchTerm.trim()}%` },
      );
    }

    // Aplicar paginación
    queryBuilder = queryBuilder
      .skip(paginationDto.skip)
      .take(paginationDto.perPage);

    // Ejecutar la consulta
    const [result, total] = await queryBuilder.getManyAndCount();

    // Formatear los resultados a DTOs
    const resultDto = result.map((estudiante) => 
      plainToClass(StudentDto, {
        ...estudiante.person,
        id: estudiante.id,
        personId: estudiante.person?.id || null,
        representative: estudiante.representative || null,
      })
    );

    // Crear y retornar el objeto de paginación
    return new PageDto(resultDto, total, paginationDto);
  }
} 