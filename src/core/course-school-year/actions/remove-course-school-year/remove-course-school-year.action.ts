import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';

@Injectable()
export class RemoveCourseSchoolYearAction {
  constructor(
    @InjectRepository(CourseSchoolYear)
    private readonly courseSchoolYearRepository: Repository<CourseSchoolYear>,
  ) {}

  /**
   * Elimina (soft delete) una asignatura por año escolar por su ID
   * @param id ID de la asignatura por año escolar a eliminar
   * @throws NotFoundException si no se encuentra la asignatura por año escolar
   */
  async execute(id: number): Promise<void> {
    // Verificar que existe la entidad
    const courseSchoolYear = await this.courseSchoolYearRepository.findOne({
      where: { id },
    });

    if (!courseSchoolYear) {
      throw new NotFoundException(`Asignatura por año escolar con ID ${id} no encontrada`);
    }

    // Soft delete
    await this.courseSchoolYearRepository.softDelete(id);
  }
} 