import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { PaginationEstudianteDto } from './dto/pagination-estudiante.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante) // Inject the Estudiante repository
    private estudianteRepository: Repository<Estudiante>,
  ) {}

  // Create a new Estudiante
  async create(createEstudianteDto: CreateEstudianteDto): Promise<Estudiante> {
    const estudiante = this.estudianteRepository.create(createEstudianteDto); // Create a new instance
    return this.estudianteRepository.save(estudiante); // Save to the database
  }

  // Update an existing Estudiante
  async update(id: number, updateEstudianteDto: UpdateEstudianteDto): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.preload({
      id,
      ...updateEstudianteDto, // Merge existing data with new data
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`); // Throw error if not found
    }
    return this.estudianteRepository.save(estudiante); // Save updated data
  }

  // Find a single Estudiante by ID
  async findOne(id: number): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOne({ where: { id } }); // Find by ID
    if (!estudiante) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`); // Throw error if not found
    }
    return estudiante;
  }

  // Find all Estudiantes with pagination, search, and filtering
  async findAll(paginationDto: PaginationEstudianteDto): Promise<{ data: Estudiante[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Estudiante> = {};

    // Add search condition if provided
    if (search) {
      where.persona = { Nombre: Like(`%${search}%`) }; // Search by Nombre in related Persona
    }

    // Add additional filters if provided
    if (filter) {
      Object.assign(where, filter); // Merge filters into the where clause
    }

    // Fetch paginated data and total count
    const [data, total] = await this.estudianteRepository.findAndCount({
      where,
      skip: (page - 1) * limit, // Calculate offset for pagination
      take: limit, // Limit the number of results
      relations: ['persona', 'representante'], // Include related Persona and Representante data
    });

    return { data, total }; // Return data and total count
  }

  // Soft-delete an Estudiante
  async remove(id: number): Promise<void> {
    const result = await this.estudianteRepository.softDelete(id); // Perform soft-delete
    if (result.affected === 0) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`); // Throw error if not found
    }
  }
}