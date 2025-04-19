import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SchoolYear } from '../../entities/school-year.entity';
import { SchoolLapse } from '../../entities/school-lapse.entity';
import { SchoolCourt } from '../../entities/school-court.entity';
import { Transactional } from 'typeorm-transactional';
import { FindSchoolYearAction } from '../find-school-year/find-school-year.action';

@Injectable()
export class RemoveSchoolYearAction {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
    @InjectRepository(SchoolLapse)
    private schoolLapseRepository: Repository<SchoolLapse>,
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
    private findSchoolYearAction: FindSchoolYearAction,
  ) {}

  @Transactional()
  async execute(id: number): Promise<void> {
    // Buscar el año escolar usando la acción especializada
    const schoolYear = await this.findSchoolYearAction.execute(id);
    if (!schoolYear) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }

    // Buscar los lapsos asociados
    const schoolLapses = await this.findSchoolLapsesBySchoolYear(id);
    if (schoolLapses.length) {
      await this.removeSchoolLapsesWithCourts(schoolLapses);
    }

    // Eliminar el año escolar
    await this.removeSchoolYear(id);
  }

  private async findSchoolLapsesBySchoolYear(
    schoolYearId: number,
  ): Promise<SchoolLapse[]> {
    return this.schoolLapseRepository.find({
      relations: ['schoolYear'],
      where: { schoolYear: { id: schoolYearId } },
    });
  }

  private async removeSchoolLapsesWithCourts(
    schoolLapses: SchoolLapse[],
  ): Promise<void> {
    const schoolLapseIds = schoolLapses.map((schoolLapse) => schoolLapse.id);

    // Buscar los cortes asociados a los lapsos
    const schoolCourts =
      await this.findSchoolCourtsBySchoolLapses(schoolLapseIds);

    // Eliminar los cortes si hay alguno
    if (schoolCourts.length > 0) {
      await this.removeSchoolCourts(schoolCourts);
    }

    // Eliminar los lapsos
    await this.schoolLapseRepository.softDelete(schoolLapseIds);
  }

  private async findSchoolCourtsBySchoolLapses(
    schoolLapseIds: string[],
  ): Promise<SchoolCourt[]> {
    return this.schoolCourtRepository.find({
      relations: ['schoolLapse'],
      where: { schoolLapse: { id: In(schoolLapseIds) } },
    });
  }

  private async removeSchoolCourts(schoolCourts: SchoolCourt[]): Promise<void> {
    const courtIds = schoolCourts.map((court) => court.id);
    await this.schoolCourtRepository.softDelete(courtIds);
  }

  private async removeSchoolYear(id: number): Promise<void> {
    const result = await this.schoolYearRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }
  }
}
