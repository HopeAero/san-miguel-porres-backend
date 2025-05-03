import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscription } from '../../entities/inscription.entity';
import { CourseInscription } from '../../entities/course-inscription.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class RemoveInscriptionAction {
  constructor(
    @InjectRepository(Inscription)
    private inscriptionRepository: Repository<Inscription>,
    @InjectRepository(CourseInscription)
    private courseInscriptionRepository: Repository<CourseInscription>,
  ) {}

  @Transactional()
  async execute(id: number): Promise<void> {
    // Verificar que la inscripción existe
    const inscription = await this.inscriptionRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!inscription) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }

    // Primero eliminar (soft delete) todas las inscripciones de asignaturas relacionadas
    await this.courseInscriptionRepository.softDelete({ inscriptionId: id });

    // Luego eliminar (soft delete) la inscripción principal
    await this.inscriptionRepository.softDelete(id);
  }
} 