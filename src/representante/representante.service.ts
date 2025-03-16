import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { Representante } from './entities/representante.entity';
import { PaginationRepresentanteDto } from './dto/pagination-representate.dto';

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representante) // Inject the Representante repository
    private representanteRepository: Repository<Representante>,
  ) {}
  async update(
    id: number,
    updateRepresentanteDto: UpdateRepresentanteDto,
  ): Promise<Representante> {
    const representante = await this.representanteRepository.preload({
      id,
      ...updateRepresentanteDto, // Merge existing data with new data
    });
    if (!representante) {
      throw new NotFoundException(`Representante with ID ${id} not found`); // Throw error if not found
    }
    return this.representanteRepository.save(representante); // Save updated data
  }

  // Find a single Representante by ID
  async findOne(id: number): Promise<Representante> {
    const representante = await this.representanteRepository.findOne({
      where: { id },
    }); // Find by ID
    if (!representante) {
      throw new NotFoundException(`Representante with ID ${id} not found`); // Throw error if not found
    }
    return representante;
  }

  // Find all Representantes with pagination, search, and filtering
  async findAll(
    paginationDto: PaginationRepresentanteDto,
  ): Promise<{ data: Representante[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Representante> = {};

    // Add search condition if provided
    if (search) {
      where.persona = { nombre: Like(`%${search}%`) }; // Search by Nombre in related Persona
    }

    // Add additional filters if provided
    if (filter) {
      Object.assign(where, filter); // Merge filters into the where clause
    }

    // Fetch paginated data and total count
    const [data, total] = await this.representanteRepository.findAndCount({
      where,
      skip: (page - 1) * limit, // Calculate offset for pagination
      take: limit, // Limit the number of results
      relations: ['persona'], // Include related Persona data
    });

    return { data, total }; // Return data and total count
  }

  // Soft-delete a Representante
  async remove(id: number): Promise<void> {
    const result = await this.representanteRepository.softDelete(id); // Perform soft-delete
    if (result.affected === 0) {
      throw new NotFoundException(`Representante with ID ${id} not found`); // Throw error if not found
    }
  }
}
