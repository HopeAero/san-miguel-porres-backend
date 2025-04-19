import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SchoolarYear } from '../../entities/schoolar-year.entity';
import { Lapse } from '../../entities/lapse.entity';
import { SchoolCourt } from '../../entities/school-court.entity';
import { Transactional } from 'typeorm-transactional';
import { FindSchoolarYearAction } from '../find-schoolar-year/find-schoolar-year.action';

@Injectable()
export class RemoveSchoolarYearAction {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
    @InjectRepository(Lapse)
    private lapseRepository: Repository<Lapse>,
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
    private findSchoolarYearAction: FindSchoolarYearAction,
  ) {}

  @Transactional()
  async execute(id: number): Promise<void> {
    // Buscar el año escolar usando la acción especializada
    const schoolarYear = await this.findSchoolarYearAction.execute(id);
    if (!schoolarYear) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }

    // Buscar los lapsos asociados
    const lapses = await this.findLapsesBySchoolarYear(id);
    if (lapses.length) {
      await this.removeLapsesWithCourts(lapses);
    }

    // Eliminar el año escolar
    await this.removeSchoolarYear(id);
  }

  private async findLapsesBySchoolarYear(
    schoolarYearId: number,
  ): Promise<Lapse[]> {
    return this.lapseRepository.find({
      relations: ['schoolYear'],
      where: { schoolYear: { id: schoolarYearId } },
    });
  }

  private async removeLapsesWithCourts(lapses: Lapse[]): Promise<void> {
    const lapseIds = lapses.map((lapse) => lapse.id);

    // Buscar los cortes asociados a los lapsos
    const courts = await this.findCourtsByLapses(lapseIds);

    // Eliminar los cortes si hay alguno
    if (courts.length > 0) {
      await this.removeCourts(courts);
    }

    // Eliminar los lapsos
    await this.lapseRepository.softDelete(lapseIds);
  }

  private async findCourtsByLapses(lapseIds: string[]): Promise<SchoolCourt[]> {
    return this.schoolCourtRepository.find({
      relations: ['lapse'],
      where: { lapse: { id: In(lapseIds) } },
    });
  }

  private async removeCourts(courts: SchoolCourt[]): Promise<void> {
    const courtIds = courts.map((court) => court.id);
    await this.schoolCourtRepository.softDelete(courtIds);
  }

  private async removeSchoolarYear(id: number): Promise<void> {
    const result = await this.schoolarYearRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }
  }
}
