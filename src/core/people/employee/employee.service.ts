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
import { FindAllEmployeeAction, PaginateEmployeeAction } from './actions';

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
    private findAllEmployeeAction: FindAllEmployeeAction,
    private paginateEmployeeAction: PaginateEmployeeAction,
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
    return this.findAllEmployeeAction.execute(searchDto);
  }

  async paginate(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<EmployeeDto>> {
    return this.paginateEmployeeAction.execute(pageOptionsDto);
  }
}
