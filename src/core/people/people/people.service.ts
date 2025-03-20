import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(Person)
    private readonly personasRepository: Repository<Person>,
  ) {}

  async create(createPersonaDto: CreatePersonDto) {
    return await this.personasRepository.save(createPersonaDto);
  }

  async paginate(pageOptionsDto: PageOptionsDto) {
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

  async update(id: number, updatePersonaDto: UpdatePersonDto) {
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
