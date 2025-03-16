import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Asignatura } from './entities/asignatura.entity';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';
import { PaginationAsignaturaDto } from './dto/pagination-asignatura.dto';

@Injectable()
export class AsignaturasService {
  constructor(
    @InjectRepository(Asignatura) // Inject the Asignatura repository
    private asignaturaRepository: Repository<Asignatura>,
  ) {}

  // Create a new Asignatura
  async create(createAsignaturaDto: CreateAsignaturaDto): Promise<Asignatura> {
    const asignatura = this.asignaturaRepository.create(createAsignaturaDto); // Create a new instance
    return this.asignaturaRepository.save(asignatura); // Save to the database
  }

  // Update an existing Asignatura
  async update(id: number, updateAsignaturaDto: UpdateAsignaturaDto): Promise<Asignatura> {
    const asignatura = await this.asignaturaRepository.preload({
      id,
      ...updateAsignaturaDto, // Merge existing data with new data
    });
    if (!asignatura) {
      throw new NotFoundException(`Asignatura with ID ${id} not found`); // Throw error if not found
    }
    return this.asignaturaRepository.save(asignatura); // Save updated data
  }

  // Find a single Asignatura by ID
  async findOne(id: number): Promise<Asignatura> {
    const asignatura = await this.asignaturaRepository.findOne({ where: { id } }); // Find by ID
    if (!asignatura) {
      throw new NotFoundException(`Asignatura with ID ${id} not found`); // Throw error if not found
    }
    return asignatura;
  }

  // Find all Asignaturas with pagination, search, and filtering
  async findAll(paginationDto: PaginationAsignaturaDto): Promise<{ data: Asignatura[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Asignatura> = {};

    // Add search condition if provided
    if (search) {
      where.Nombre = Like(`%${search}%`); // Search by Nombre
    }

    // Add additional filters if provided
    if (filter) {
      Object.assign(where, filter); // Merge filters into the where clause
    }

    // Fetch paginated data and total count
    const [data, total] = await this.asignaturaRepository.findAndCount({
      where,
      skip: (page - 1) * limit, // Calculate offset for pagination
      take: limit, // Limit the number of results
    });

    return { data, total }; // Return data and total count
  }

  // Soft-delete an Asignatura
  async remove(id: number): Promise<void> {
    const result = await this.asignaturaRepository.softDelete(id); // Perform soft-delete
    if (result.affected === 0) {
      throw new NotFoundException(`Asignatura with ID ${id} not found`); // Throw error if not found
    }
  }
}