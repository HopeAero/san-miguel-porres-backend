import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscription } from './entities/inscription.entity';
import { CourseInscription } from './entities/course-inscription.entity';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { PaginateInscriptionDto } from './dto/paginate-inscription.dto';
import {
  CreateInscriptionAction,
  UpdateInscriptionAction,
  FindInscriptionAction,
  RemoveInscriptionAction,
  PaginateInscriptionAction
} from './actions';

@Injectable()
export class InscriptionsService {
  constructor(
    @InjectRepository(Inscription)
    private inscriptionRepository: Repository<Inscription>,
    @InjectRepository(CourseInscription)
    private courseInscriptionRepository: Repository<CourseInscription>,
    private readonly createInscriptionAction: CreateInscriptionAction,
    private readonly updateInscriptionAction: UpdateInscriptionAction,
    private readonly findInscriptionAction: FindInscriptionAction,
    private readonly removeInscriptionAction: RemoveInscriptionAction,
    private readonly paginateInscriptionAction: PaginateInscriptionAction
  ) {}

  // Obtener lista paginada de inscripciones
  async findAll(paginateDto: PaginateInscriptionDto) {
    return this.paginateInscriptionAction.execute(paginateDto);
  }

  // Obtener una inscripción por ID
  async findOne(id: number) {
    return this.findInscriptionAction.execute(id);
  }

  // Crear una nueva inscripción
  async create(createInscriptionDto: CreateInscriptionDto) {
    return this.createInscriptionAction.execute(createInscriptionDto);
  }

  // Actualizar una inscripción existente
  async update(id: number, updateInscriptionDto: UpdateInscriptionDto) {
    return this.updateInscriptionAction.execute(id, updateInscriptionDto);
  }

  // Eliminar una inscripción
  async remove(id: number) {
    return this.removeInscriptionAction.execute(id);
  }

  // Método para verificar que la base de datos tenga inscripciones
  async getInscriptionsCount(): Promise<{ count: number }> {
    const count = await this.inscriptionRepository.count();
    return { count };
  }

  // Método para verificar que la base de datos tenga inscripciones de cursos
  async getCourseInscriptionsCount(): Promise<{ count: number }> {
    const count = await this.courseInscriptionRepository.count();
    return { count };
  }
}
