import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { AnoEscolar } from './entities/ano-escolar.entity';
import { CreateAnoEscolarDto } from './dto/create-ano-escolar.dto';
import { UpdateAnoEscolarDto } from './dto/update-ano-escolar.dto';
import { PaginationAnoEscolarDto } from './dto/pagination-ano-escolar.dto';

@Injectable()
export class AnoEscolarService {
  constructor(
    @InjectRepository(AnoEscolar) // Inject the AnoEscolar repository
    private anoEscolarRepository: Repository<AnoEscolar>,
  ) {}

  // Create a new AnoEscolar
  async create(createAnoEscolarDto: CreateAnoEscolarDto): Promise<AnoEscolar> {
    const anoEscolar = this.anoEscolarRepository.create(createAnoEscolarDto); // Create a new instance
    return this.anoEscolarRepository.save(anoEscolar); // Save to the database
  }

  // Update an existing AnoEscolar
  async update(id: number, updateAnoEscolarDto: UpdateAnoEscolarDto): Promise<AnoEscolar> {
    const anoEscolar = await this.anoEscolarRepository.preload({
      id,
      ...updateAnoEscolarDto, // Merge existing data with new data
    });
    if (!anoEscolar) {
      throw new NotFoundException(`AnoEscolar with ID ${id} not found`); // Throw error if not found
    }
    return this.anoEscolarRepository.save(anoEscolar); // Save updated data
  }

  // Find a single AnoEscolar by ID
  async findOne(id: number): Promise<AnoEscolar> {
    const anoEscolar = await this.anoEscolarRepository.findOne({ where: { id } }); // Find by ID
    if (!anoEscolar) {
      throw new NotFoundException(`AnoEscolar with ID ${id} not found`); // Throw error if not found
    }
    return anoEscolar;
  }

  // Find all AnoEscolar with pagination, search, and filtering
  async findAll(paginationDto: PaginationAnoEscolarDto): Promise<{ data: AnoEscolar[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<AnoEscolar> = {};

    // Add search condition if provided
    if (search) {
      where.codigo = Like(`%${search}%`); // Search by codigo
    }

    // Add additional filters if provided
    if (filter) {
      Object.assign(where, filter); // Merge filters into the where clause
    }

    // Fetch paginated data and total count
    const [data, total] = await this.anoEscolarRepository.findAndCount({
      where,
      skip: (page - 1) * limit, // Calculate offset for pagination
      take: limit, // Limit the number of results
    });

    return { data, total }; // Return data and total count
  }

  // Soft-delete an AnoEscolar
  async remove(id: number): Promise<void> {
    const result = await this.anoEscolarRepository.softDelete(id); // Perform soft-delete
    if (result.affected === 0) {
      throw new NotFoundException(`AnoEscolar with ID ${id} not found`); // Throw error if not found
    }
  }
}