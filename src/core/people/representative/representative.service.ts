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
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { PeopleService } from '../people/people.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { Representative } from './entities/representative.entity';
import { RepresentativeDto } from './dto/representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';

function formatRepresentative(
  representativeEntity: Representative,
): RepresentativeDto {
  return plainToClass(RepresentativeDto, {
    ...representativeEntity.person,
    id: representativeEntity.id,
    students: representativeEntity.students || null,
    personId: representativeEntity.person?.id || null,
  });
}

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representative)
    private representativeRepository: Repository<Representative>,
    @Inject(forwardRef(() => PeopleService))
    private peopleService: WrapperType<PeopleService>,
  ) {}

  @Transactional()
  async create(
    createRepresentanteDto: CreateRepresentativeDto,
  ): Promise<RepresentativeDto> {
    const person = await this.peopleService.create(createRepresentanteDto);
    const representative = this.representativeRepository.create({
      person,
    });
    const savedRepresentative =
      await this.representativeRepository.save(representative);
    return await this.findOne(savedRepresentative.id);
  }

  async update(
    id: number,
    updateRepresentanteDto: UpdateRepresentativeDto,
  ): Promise<RepresentativeDto> {
    const representante = await this.representativeRepository.preload({
      id,
      ...updateRepresentanteDto,
    });
    if (!representante) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }
    const updatedRepresentative =
      await this.representativeRepository.save(representante);
    return await this.findOne(updatedRepresentative.id);
  }

  // Find a single Representante by ID
  async findOne(id: number): Promise<RepresentativeDto> {
    const representante = await this.representativeRepository.findOne({
      where: { id },
      relations: {
        person: true,
        students: true,
      },
    });

    if (!representante) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }

    return formatRepresentative(representante);
  }

  async paginate(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<RepresentativeDto>> {
    const [result, total] = await this.representativeRepository.findAndCount({
      order: {
        id: pageOptionsDto.order,
      },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
      relations: {
        person: true,
        students: true,
      },
    });

    const representatives: RepresentativeDto[] = result.map(
      (representativeEntity: Representative) => {
        return formatRepresentative(representativeEntity);
      },
    );

    return new PageDto(representatives, total, pageOptionsDto);
  }

  // Soft-delete a Representante
  async remove(id: number): Promise<void> {
    const result = await this.peopleService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }
  }
}
