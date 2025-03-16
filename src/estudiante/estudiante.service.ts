import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { PaginationEstudianteDto } from './dto/pagination-estudiante.dto';
import { PersonasService } from '@/personas/personas.service';
import { CreatePersonaDto } from '@/personas/dto/create-persona.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdatePersonaDto } from '@/personas/dto/update-persona.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @Inject(forwardRef(() => PersonasService))
    private personasService: PersonasService,
  ) {}

  @Transactional()
  async create(createEstudianteDto: CreatePersonaDto): Promise<Estudiante> {
    const persona = await this.personasService.create(createEstudianteDto);
    const estudiante = await this.estudianteRepository.create({ persona });
    return this.estudianteRepository.save(estudiante);
  }
  async update(
    id: number,
    updateEstudianteDto: UpdatePersonaDto,
  ): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.preload({
      id,
      ...updateEstudianteDto,
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`);
    }

    return this.estudianteRepository.save(estudiante);
  }

  // Find a single Estudiante by ID
  async findOne(id: number): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`); // Throw error if not found
    }
    return estudiante;
  }

  async findPaginated(
    paginationDto: PaginationEstudianteDto,
  ): Promise<{ data: Estudiante[]; total: number }> {
    const { page, limit, search, filter } = paginationDto;
    const where: FindOptionsWhere<Estudiante> = {};

    if (search) {
      where.persona = { nombre: Like(`%${search}%`) };
    }
    if (filter) {
      Object.assign(where, filter);
    }

    // Fetch paginated data and total count
    const [data, total] = await this.estudianteRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['persona', 'representante'],
    });

    return { data, total };
  }

  // Soft-delete an Estudiante
  async remove(id: number): Promise<void> {
    const result = await this.personasService.remove(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`); // Throw error if not found
    }
  }
}
