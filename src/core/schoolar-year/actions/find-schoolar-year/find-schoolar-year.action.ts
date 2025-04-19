import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolarYear } from '../../entities/schoolar-year.entity';

@Injectable()
export class FindSchoolarYearAction {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
  ) {}

  /**
   * Encuentra un año escolar por su ID, incluyendo sus lapsos y cortes
   * @param id El ID del año escolar a buscar
   * @returns El año escolar con sus lapsos y cortes
   * @throws NotFoundException si el año escolar no existe
   */
  async execute(id: number): Promise<SchoolarYear> {
    const schoolarYear = await this.schoolarYearRepository
      .createQueryBuilder('schoolarYear')
      .leftJoinAndSelect('schoolarYear.lapses', 'lapse')
      .leftJoinAndSelect('lapse.scholarCourts', 'court')
      .where('schoolarYear.id = :id', { id })
      .getOne();

    if (!schoolarYear) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }

    return schoolarYear;
  }
}
