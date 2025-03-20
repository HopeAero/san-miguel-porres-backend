import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Representante } from './entities/representante.entity';
import { Transactional } from 'typeorm-transactional';
import { CreatePersonaDto } from '@/core/personas/dto/create-persona.dto';
import { PersonasService } from '@/core/personas/personas.service';
import { WrapperType } from '@/wrapper.type';
import { UpdatePersonaDto } from '@/core/personas/dto/update-persona.dto';
import { plainToClass } from 'class-transformer';
import {
  RepresentantePersona,
  RepresentantePersonaDto,
} from './dto/RepresentantePersona.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';

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
  async findOne(id: number): Promise<RepresentantePersonaDto> {
    const representante = await this.representanteRepository.findOne({
      where: { id },
      relations: ['persona', 'estudiantes'],
    });

    const representanteDto = plainToClass(RepresentantePersonaDto, {
      id: representante.id,
      alumnos: representante.estudiantes,
      ...representante.persona,
    });

    return representanteDto;
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    const [result, total] = await this.representanteRepository.findAndCount({
      order: {
        id: pageOptionsDto.order,
      },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
      relations: ['persona', 'estudiantes'],
    });

    const representantes: RepresentantePersona[] = result.map(
      (representante) => {
        const representanteDto = plainToClass(RepresentantePersonaDto, {
          id: representante.id,
          alumnos: representante.estudiantes,
          ...representante.persona,
        });

        return representanteDto;
      },
    );

    return new PageDto(representantes, total, pageOptionsDto);
  }

  // Soft-delete a Representante
  async remove(id: number): Promise<void> {
    const result = await this.personasService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }
  }
}
