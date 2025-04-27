import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { EmployeeDto } from '../../dto/employee';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PaginateEmployeeAction {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Pagina la lista de empleados con opciones
   * @param pageOptionsDto Opciones de paginación
   * @returns Lista paginada de empleados
   */
  async execute(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EmployeeDto>> {
    // Si se proporcionó un searchTerm, utilizar queryBuilder para la búsqueda
    if (
      pageOptionsDto.searchTerm !== undefined &&
      pageOptionsDto.searchTerm !== null &&
      pageOptionsDto.searchTerm.trim() !== ''
    ) {
      return this.executeWithSearch(pageOptionsDto);
    }

    // Si no hay searchTerm, usar el método findAndCount estándar
    const [result, total] = await this.employeeRepository.findAndCount({
      order: {
        id: pageOptionsDto.order,
      },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
      relations: {
        person: true,
      },
    });

    const employees: EmployeeDto[] = result.map((employeeEntity: Employee) => {
      return this.formatEmployee(employeeEntity);
    });

    return new PageDto(employees, total, pageOptionsDto);
  }

  /**
   * Ejecuta la paginación con búsqueda por término
   * @param pageOptionsDto Opciones de paginación con término de búsqueda
   * @returns Lista paginada y filtrada de empleados
   */
  private async executeWithSearch(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EmployeeDto>> {
    const queryBuilder = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.person', 'person')
      .where('employee.deletedAt IS NULL');

    // Aplicar filtro de búsqueda por nombre, apellido o documento
    queryBuilder.andWhere(
      '(person.name ILIKE :searchTerm OR person.lastName ILIKE :searchTerm OR person.dni ILIKE :searchTerm)',
      { searchTerm: `%${pageOptionsDto.searchTerm.trim()}%` },
    );

    // Ordenar y paginar
    queryBuilder
      .orderBy('employee.id', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.perPage);

    // Ejecutar la consulta
    const [result, total] = await queryBuilder.getManyAndCount();

    // Formatear los resultados
    const employees = result.map((employeeEntity) =>
      this.formatEmployee(employeeEntity),
    );

    return new PageDto(employees, total, pageOptionsDto);
  }

  /**
   * Formatea una entidad de empleado a un DTO
   * @param employeeEntity La entidad de empleado a formatear
   * @returns El DTO formateado
   */
  private formatEmployee(employeeEntity: Employee): EmployeeDto {
    return plainToClass(EmployeeDto, {
      ...employeeEntity.person,
      id: employeeEntity.id,
      personId: employeeEntity.person?.id || null,
      employeeType: employeeEntity.employeeType,
    });
  }
} 