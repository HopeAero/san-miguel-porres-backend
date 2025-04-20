import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { SchoolYear } from '../../entities/school-year.entity';
import { CreateSchoolYearDto } from '../../dto/create-school-year.dto';

@Injectable()
export class UpdateSchoolYearBasicAction {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
  ) {}

  async execute(
    id: number,
    updateData: Partial<CreateSchoolYearDto>,
  ): Promise<SchoolYear> {
    // Verificar que el año escolar existe
    const existingSchoolYear = await this.findBasicSchoolYear(id);

    // Actualizar datos básicos del año escolar
    await this.schoolYearRepository.update(id, {
      ...existingSchoolYear,
      ...updateData,
    });

    // Devolver el año escolar actualizado
    return this.findBasicSchoolYear(id);
  }

  async findBasicSchoolYear(id: number): Promise<SchoolYear> {
    const schoolYear = await this.schoolYearRepository.findOne({
      where: { id: Equal(id) },
    });

    if (!schoolYear) {
      throw new NotFoundException(
        `El año escolar con el ID ${id} no fue encontrado`,
      );
    }

    return schoolYear;
  }
}
