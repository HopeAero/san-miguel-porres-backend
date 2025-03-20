import { Injectable } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-person.dto';
import { UpdatePersonaDto } from './dto/update-person.dto';
import { Repository } from 'typeorm';
import { Persona } from './entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personasRepository: Repository<Persona>,
  ) {}

  async create(createPersonaDto: CreatePersonaDto) {
    return await this.personasRepository.save(createPersonaDto);
  }

  async findAllPaginated(pageOptionsDto: PageOptionsDto) {
    const [result, total] = await this.personasRepository.findAndCount({
      order: {
        createdAt: pageOptionsDto.order,
      },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
    });

    return new PageDto(result, total, pageOptionsDto);
  }

  async findAll() {
    return await this.personasRepository.find();
  }

  async findOne(id: number) {
    const persona = await this.personasRepository.findOne({
      where: { id },
    });

    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    const persona = await this.personasRepository.findOne({
      where: { id },
    });

    if (!persona) {
      throw new Error('Esta persona no existe');
    }

    return await this.personasRepository.save({
      ...persona,
      ...updatePersonaDto,
    });
  }

  async remove(id: number) {
    const persona = await this.personasRepository.findOne({
      where: { id },
    });

    if (!persona) {
      throw new Error('Esta persona no existe');
    }

    return await this.personasRepository.softDelete(persona);
  }
}
