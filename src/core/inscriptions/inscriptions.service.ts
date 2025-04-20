import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscription } from './entities/inscription.entity';
import { CourseInscription } from './entities/course-inscription.entity';

@Injectable()
export class InscriptionsService {
  constructor(
    @InjectRepository(Inscription)
    private inscriptionRepository: Repository<Inscription>,
    @InjectRepository(CourseInscription)
    private courseInscriptionRepository: Repository<CourseInscription>,
  ) {}

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
