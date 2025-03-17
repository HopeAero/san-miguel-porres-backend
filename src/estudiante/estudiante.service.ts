import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { PersonasService } from '@/personas/personas.service';
import { CreatePersonaDto } from '@/personas/dto/create-persona.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdatePersonaDto } from '@/personas/dto/update-persona.dto';
import { WrapperType } from '@/wrapper.type';
import { plainToClass } from 'class-transformer';
import { EstudiantePersonaDto } from './dto/EstudiantePersona.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @Inject(forwardRef(() => PersonasService))
    private personasService: WrapperType<PersonasService>,
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
  async findOne(id: number): Promise<EstudiantePersonaDto> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['persona', 'representante'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`);
    }

    const estudiantePersonaDto = plainToClass(EstudiantePersonaDto, {
      id: estudiante.id,
      representante: estudiante.representante,
      ...estudiante.persona,
    });

    return estudiantePersonaDto;
  }

  async findPaginated(paginationDto: PageOptionsDto) {
    const [result, total] = await this.estudianteRepository.findAndCount({
      order: {
        id: paginationDto.order,
      },
      take: paginationDto.perPage,
      skip: paginationDto.skip,
      relations: ['persona', 'representante'],
    });

    return new PageDto(result, total, paginationDto);
  }

  // Soft-delete an Estudiante
  async remove(id: number): Promise<void> {
    const result = await this.personasService.remove(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`); // Throw error if not found
    }
  }
}
