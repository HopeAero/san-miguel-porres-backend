import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { Representante } from './entities/representante.entity';
import { PaginationRepresentanteDto } from './dto/pagination-representate.dto';

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representante)
    private representanteRepository: Repository<Representante>,
  ) {}
  async update(
    id: number,
    updateRepresentanteDto: UpdateRepresentanteDto,
  ): Promise<Representante> {
    const representante = await this.representanteRepository.preload({
      id,
      ...updateRepresentanteDto,
    });
    if (!representante) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }
    return this.representanteRepository.save(representante);
  }

  // Find a single Representante by ID
  async findOne(id: number): Promise<Representante> {
    const representante = await this.representanteRepository.findOne({
      where: { id },
    }); // Find by ID
    if (!representante) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }
    return representante;
  }

  async findAll(
    paginationDto: PaginationRepresentanteDto,
  ): Promise<{ data: Representante[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Representante> = {};

    if (search) {
      where.persona = { nombre: Like(`%${search}%`) };
    }

    if (filter) {
      Object.assign(where, filter);
    }

    const [data, total] = await this.representanteRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['persona'],
    });

    return { data, total };
  }

  // Soft-delete a Representante
  async remove(id: number): Promise<void> {
    const result = await this.representanteRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }
  }
}
