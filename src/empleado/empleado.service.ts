import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { PaginationEmpleadoDto } from './dto/pagination-empleado.dto';

@Injectable()
export class EmpleadoService {
  constructor(
    @InjectRepository(Empleado) // Inject the Empleado repository
    private empleadoRepository: Repository<Empleado>,
  ) {}

  // Create a new Empleado
  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<Empleado> {
    const empleado = this.empleadoRepository.create(createEmpleadoDto); // Create a new instance
    return this.empleadoRepository.save(empleado); // Save to the database
  }

  // Update an existing Empleado
  async update(id: number, updateEmpleadoDto: UpdateEmpleadoDto): Promise<Empleado> {
    const empleado = await this.empleadoRepository.preload({
      id,
      ...updateEmpleadoDto, // Merge existing data with new data
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado with ID ${id} not found`); // Throw error if not found
    }
    return this.empleadoRepository.save(empleado); // Save updated data
  }

  // Find a single Empleado by ID
  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({ where: { id } }); // Find by ID
    if (!empleado) {
      throw new NotFoundException(`Empleado with ID ${id} not found`); // Throw error if not found
    }
    return empleado;
  }

  // Find all Empleados with pagination, search, and filtering
  async findAll(paginationDto: PaginationEmpleadoDto): Promise<{ data: Empleado[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Empleado> = {};

    // Add search condition if provided
    if (search) {
      where.persona = { Nombre: Like(`%${search}%`) }; // Search by Nombre in related Persona
    }

    // Add additional filters if provided
    if (filter) {
      Object.assign(where, filter); // Merge filters into the where clause
    }

    // Fetch paginated data and total count
    const [data, total] = await this.empleadoRepository.findAndCount({
      where,
      skip: (page - 1) * limit, // Calculate offset for pagination
      take: limit, // Limit the number of results
      relations: ['persona'], // Include related Persona data
    });

    return { data, total }; // Return data and total count
  }

  // Soft-delete an Empleado
  async remove(id: number): Promise<void> {
    const result = await this.empleadoRepository.softDelete(id); // Perform soft-delete
    if (result.affected === 0) {
      throw new NotFoundException(`Empleado with ID ${id} not found`); // Throw error if not found
    }
  }
}