import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { WrapperType } from '@/wrapper.type';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
<<<<<<< HEAD:src/core/representante/representante.service.ts
import {
  RepresentantePersona,
  RepresentantePersonaDto,
} from './dto/RepresentantePersona.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
=======
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreatePersonaDto } from '../personas/dto/create-persona.dto';
import { UpdatePersonaDto } from '../personas/dto/update-persona.dto';
import { PersonasService } from '../personas/personas.service';
import { RepresentantePersonaDto } from './dto/RepresentantePersona.dto';
import { Representante } from './entities/representante.entity';
>>>>>>> 86702ef (feat: update user):src/peopleModule/representante/representante.service.ts

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
      alumnos: representante.student,
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
