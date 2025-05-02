import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { EmployeeDto } from '../../dto/employee';
import { plainToClass } from 'class-transformer';
import { SearchEmployeeDto } from '../../dto/search-employee.dto';

@Injectable()
export class FindAllEmployeeAction {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Encuentra todos los empleados con opciones de filtrado
   * @param searchDto Criterios de búsqueda opcionales (nombre, tipo de empleado, límite)
   * @returns Lista de empleados filtrada
   */
  async execute(searchDto?: SearchEmployeeDto): Promise<EmployeeDto[]> {
    let result: EmployeeDto[] = [];

    // Si no hay criterios de búsqueda, usamos el método simple
    if (
      !searchDto ||
      (!searchDto.name &&
        !searchDto.employeeType &&
        !searchDto.limit &&
        !searchDto.forceItemsIds)
    ) {
      const employees = await this.employeeRepository.find({
        relations: {
          person: true,
        },
      });
      result = employees.map((employeeEntity: Employee) => {
        return this.formatEmployee(employeeEntity);
      });
    } else {
      // Si hay criterios, construimos una consulta más compleja
      const query = this.employeeRepository
        .createQueryBuilder('employee')
        .leftJoinAndSelect('employee.person', 'person')
        .where('employee.deletedAt IS NULL');

      // Aplicar filtro por tipo de empleado si se proporciona
      if (searchDto.employeeType) {
        query.andWhere('employee.employeeType = :employeeType', {
          employeeType: searchDto.employeeType,
        });
      }

      // Aplicar filtro por nombre si se proporciona (autocomplete)
      if (searchDto.name) {
        query.andWhere(
          '(person.name ILIKE :search OR person.lastName ILIKE :search)',
          {
            search: `%${searchDto.name}%`,
          },
        );
      }

      // Ordenar por nombre y apellido
      query.orderBy('person.name', 'ASC').addOrderBy('person.lastName', 'ASC');

      // Aplicar límite si se proporciona
      if (searchDto.limit && searchDto.limit > 0) {
        query.take(searchDto.limit);
      }

      const employees = await query.getMany();

      // Formatear resultados
      result = employees.map((employeeEntity: Employee) => {
        return this.formatEmployee(employeeEntity);
      });
    }

    return this.getResultWithForceItemsIds(result, searchDto?.forceItemsIds);
  }

  /**
   * Añade elementos forzados por ID a los resultados existentes
   * @param result Resultados iniciales
   * @param forceItemsIds String con IDs de elementos forzados separados por coma
   * @returns Resultados con los elementos forzados añadidos
   */
  private async getResultWithForceItemsIds(
    result: EmployeeDto[],
    forceItemsIds: string | null | undefined,
  ): Promise<EmployeeDto[]> {
    // Si hay IDs forzados, buscarlos y añadirlos al resultado
    if (forceItemsIds && forceItemsIds.trim()) {
      // Separar los IDs y convertirlos a números
      const neededItemsIds = this.getNeededItemsIds(
        forceItemsIds,
        result.map((employee) => employee.id),
      );

      if (!neededItemsIds.length) return result;

      // Buscar los empleados por los IDs forzados, incluyendo eliminados
      const forcedEmployees = await this.employeeRepository.find({
        where: { id: In(neededItemsIds) },
        relations: {
          person: true,
        },
        withDeleted: true,
      });

      // Añadir los empleados forzados al resultado
      const additionalEmployees = forcedEmployees.map((employee) =>
        this.formatEmployee(employee),
      );

      // Concatenar los resultados
      result = result.concat(additionalEmployees);
    }

    return result;
  }

  /**
   * Determina qué IDs necesitan ser buscados específicamente
   * @param forceItemsIdsInput String con IDs de elementos forzados separados por coma
   * @param currentEmployeeIds IDs de empleados ya obtenidos
   * @returns Lista de IDs que necesitan ser buscados adicionalmente
   */
  private getNeededItemsIds(
    forceItemsIdsInput: string | null | undefined,
    currentEmployeeIds: number[],
  ): number[] {
    if (!forceItemsIdsInput) return [];

    const forceItemsIds = forceItemsIdsInput
      .split(',')
      .map((id) => id.trim())
      .filter((id) => !isNaN(Number(id)))
      .map((id) => Number(id));

    return forceItemsIds.filter((id) => !currentEmployeeIds.includes(id));
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