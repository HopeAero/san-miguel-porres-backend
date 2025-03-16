import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Representante } from './entities/representante.entity';
import { PaginationRepresentanteDto } from './dto/pagination-representate.dto';
import { Transactional } from 'typeorm-transactional';
import { CreatePersonaDto } from '@/personas/dto/create-persona.dto';
import { PersonasService } from '@/personas/personas.service';
import { WrapperType } from '@/wrapper.type';
import { UpdatePersonaDto } from '@/personas/dto/update-persona.dto';
import { plainToClass } from 'class-transformer';
import { EstudiantePersonaDto } from '@/estudiante/dto/EstudiantePersona.dto';

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representante)
    private representanteRepository: Repository<Representante>,
    @Inject(forwardRef(() => PersonasService))
    private personasService: WrapperType<PersonasService>,
  ) {}

  @Transactional()
  async create(
    createRepresentanteDto: CreatePersonaDto,
  ): Promise<Representante> {
    const persona = await this.personasService.create(createRepresentanteDto);
    const representante = await this.representanteRepository.create({
      persona,
    });
    return this.representanteRepository.save(representante);
  }

  async update(
    id: number,
    updateRepresentanteDto: UpdatePersonaDto,
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
  async findOne(id: number): Promise<EstudiantePersonaDto> {
    const representante = await this.representanteRepository.findOne({
      where: { id },
      relations: ['persona'],
    });

    const representanteDto = plainToClass(EstudiantePersonaDto, representante);

    return representanteDto;
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
    const result = await this.personasService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }
  }
}
