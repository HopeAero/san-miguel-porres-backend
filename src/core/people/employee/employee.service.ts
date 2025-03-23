import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { PaginationEmployeeDto } from './dto/pagination-employee.dto';
import { WrapperType } from '@/wrapper.type';
import { PeopleService } from '@/core/people/people/people.service';
import { EmployeeDto } from './dto/employee';
import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private peopleService: WrapperType<PeopleService>,
  ) {}

  async create(createEmpleadoDto: CreateEmployeeDTO): Promise<Employee> {
    const person = await this.peopleService.create(createEmpleadoDto);
    const representative = this.employeeRepository.create({
      person,
    });
    return await this.employeeRepository.save(representative);
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

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Empleado with ID ${id} not found`);
    }
    return employee;
  }

  async findAll(
    paginationDto: PaginationEmployeeDto,
  ): Promise<{ data: Employee[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Employee> = {};

    if (search) {
      where.person = { name: Like(`%${search}%`) };
    }

    if (filter) {
      Object.assign(where, filter);
    }

    const [data, total] = await this.employeeRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        person: true,
      },
    });

    return { data, total };
  }

  async remove(id: number): Promise<void> {
    const result = await this.employeeRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
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
      const employees: EmployeeDto = plainToClass(EmployeeDto, {
        ...employeeEntity.person,
        id: employeeEntity.id,
      });

      return employees;
    });

    return new PageDto(employees, total, pageOptionsDto);
  }
}
