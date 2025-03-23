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
import { UpdatePersonDto } from '../people/dto/update-person.dto';
import { PeopleService } from '../people/people.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { Representative } from './entities/representative.entity';
import { RepresentativeDto } from './dto/representative.dto';

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
  ): Promise<Representative> {
    const person = await this.peopleService.create(createRepresentanteDto);
    const representative = this.representativeRepository.create({
      person,
    });
    return this.representativeRepository.save(representative);
  }

  async update(
    id: number,
    updateRepresentanteDto: UpdatePersonDto,
  ): Promise<Representative> {
    const representante = await this.peopleService.update(
      id,
      updateRepresentanteDto,
    );

    if (!representante) {
      throw new NotFoundException(
        `No se encontro el representante con el ID ${id}`,
      );
    }
    return this.representativeRepository.save(representante);
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
      throw new NotFoundException(
        `No se encontro el representante con el ID ${id}`,
      );
    }

    const representanteDto = plainToClass(RepresentativeDto, {
      ...representante.person,
      id: representante.id,
      students: representante.students,
    });

    return representanteDto;
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
        const representative: RepresentativeDto = plainToClass(
          RepresentativeDto,
          {
            ...representativeEntity.person,
            id: representativeEntity.id,
            students: representativeEntity.students,
          },
        );

        return representative;
      },
    );

    return new PageDto(representatives, total, pageOptionsDto);
  }

  // Soft-delete a Representante
  async remove(id: number): Promise<void> {
    const result = await this.peopleService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `No se encontro el representante con el ID ${id}`,
      );
    }
  }
}
