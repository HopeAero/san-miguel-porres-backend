import { Injectable } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';

@Injectable()
export class PersonasService {
  constructor(private readonly personasRepository: Repository<Persona>) {}

  async create(createPersonaDto: CreatePersonaDto) {
    return await this.personasRepository.save(createPersonaDto);
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
