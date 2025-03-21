import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { PaginationEmployeeDto } from './dto/pagination-employee.dto';
import { WrapperType } from '@/wrapper.type';
import { PeopleService } from '@/core/people/people/people.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) // Inject the Empleado repository
    private employeeRepository: Repository<Employee>,
    private peopleService: WrapperType<PeopleService>,
  ) {}

  // Create a new Empleado
  async create(createEmpleadoDto: CreateEmployeeDTO): Promise<Employee> {
    const person = await this.peopleService.create(createEmpleadoDto);
    const representative = this.employeeRepository.create({
      person,
    });
    return await this.employeeRepository.save(representative);
  }

  // Update an existing Empleado
  async update(
    id: number,
    updateEmpleadoDto: CreateEmployeeDTO,
  ): Promise<Employee> {
    const empleado = await this.employeeRepository.preload({
      id,
      ...updateEmpleadoDto,
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado with ID ${id} not found`); // Throw error if not found
    }
    return this.employeeRepository.save(empleado); // Save updated data
  }

  // Find a single Empleado by ID
  async findOne(id: number): Promise<Employee> {
    const empleado = await this.employeeRepository.findOne({ where: { id } }); // Find by ID
    if (!empleado) {
      throw new NotFoundException(`Empleado with ID ${id} not found`); // Throw error if not found
    }
    return empleado;
  }

  // Find all Empleados with pagination, search, and filtering
  async findAll(
    paginationDto: PaginationEmployeeDto,
  ): Promise<{ data: Employee[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Employee> = {};

    // Add search condition if provided
    if (search) {
      where.person = { name: Like(`%${search}%`) }; // Search by Nombre in related Persona
    }

    // Add additional filters if provided
    if (filter) {
      Object.assign(where, filter); // Merge filters into the where clause
    }

    // Fetch paginated data and total count
    const [data, total] = await this.employeeRepository.findAndCount({
      where,
      skip: (page - 1) * limit, // Calculate offset for pagination
      take: limit, // Limit the number of results
      relations: ['persona'], // Include related Persona data
    });

    return { data, total }; // Return data and total count
  }

  // Soft-delete an Empleado
  async remove(id: number): Promise<void> {
    const result = await this.employeeRepository.softDelete(id); // Perform soft-delete
    if (result.affected === 0) {
      throw new NotFoundException(`Empleado with ID ${id} not found`); // Throw error if not found
    }
  }
}
