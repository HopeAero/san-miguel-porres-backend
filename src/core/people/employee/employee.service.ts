import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { WrapperType } from '@/wrapper.type';
import { PeopleService } from '@/core/people/people/people.service';
import { EmployeeDto } from './dto/employee';
import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { plainToClass } from 'class-transformer';
import { Transactional } from 'typeorm-transactional';
import { SearchEmployeeDto } from './dto/search-employee.dto';

function formatEmployee(employeeEntity: Employee): EmployeeDto {
  return plainToClass(EmployeeDto, {
    ...employeeEntity.person,
    id: employeeEntity.id,
    personId: employeeEntity.person?.id || null,
    employeeType: employeeEntity.employeeType,
  });
}

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @Inject(forwardRef(() => PeopleService))
    private peopleService: WrapperType<PeopleService>,
  ) {}

  @Transactional()
  async create(createEmpleadoDto: CreateEmployeeDTO): Promise<EmployeeDto> {
    const person = await this.peopleService.create(createEmpleadoDto);
    const employee = this.employeeRepository.create({
      person,
      employeeType: createEmpleadoDto.employeeType,
    });
    const savedEmployee = await this.employeeRepository.save(employee);
    return await this.findOne(savedEmployee.id);
  }

  async update(
    id: number,
    updateEmpleadoDto: CreateEmployeeDTO,
  ): Promise<void> {
    const { employeeType, ...personDto } = updateEmpleadoDto;

    if (employeeType) {
      const updatedEmployee = await this.employeeRepository.update(id, {
        employeeType,
      });

      if (updatedEmployee.affected === 0) {
        throw new NotFoundException(`Empleado no encontrado con el ID ${id}`);
      }
    }

    if (personDto) {
      const employee = await this.peopleService.update(id, personDto);

      if (!employee) {
        throw new NotFoundException(`Empleado no encontrado con el ID ${id}`);
      }
    }

    if (!employeeType && !personDto) {
      throw new NotFoundException(
        'No se ha enviado información para actualizar',
      );
    }

    return;
  }

  async findOne(id: number): Promise<EmployeeDto> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: {
        person: true,
      },
    });
    if (!employee) {
      throw new NotFoundException(`Empleado with ID ${id} not found`);
    }
    return formatEmployee(employee);
  }

  async remove(id: number): Promise<void> {
    const result = await this.employeeRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  /**
   * Encuentra todos los empleados con opciones de filtrado
   * @param searchDto Criterios de búsqueda opcionales (nombre, tipo de empleado, límite)
   * @returns Lista de empleados filtrada
   */
  async findAll(searchDto?: SearchEmployeeDto): Promise<EmployeeDto[]> {
    // Si no hay criterios de búsqueda, usamos el método simple
    if (!searchDto || (!searchDto.name && !searchDto.employeeType && !searchDto.limit)) {
      const employees = await this.employeeRepository.find({
        relations: {
          person: true,
        },
      });
      return employees.map((employeeEntity: Employee) => {
        return formatEmployee(employeeEntity);
      });
    }

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

    console.log('Employee search query:', query.getSql());

    const employees = await query.getMany();

    // Formatear resultados
    return employees.map((employeeEntity: Employee) => {
      return formatEmployee(employeeEntity);
    });
  }

  async paginate(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EmployeeDto>> {
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
      return formatEmployee(employeeEntity);
    });

    return new PageDto(employees, total, pageOptionsDto);
  }
}
