import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { SchoolarYear } from '../../entities/schoolar-year.entity';
import { Lapse } from '../../entities/lapse.entity';
import { SchoolCourt } from '../../entities/school-court.entity';
import { UpdateSchoolarYearDto } from '../../dto/update-schoolar-year.dto';
import { UpdateCreateLapseDto } from '../../dto/create-lapse.dto';
import { UpdateCreateScholarCourtDto } from '../../dto/create-scholar-court.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdateDateValidationHelper } from './update-date-validation.helper';
import { FindSchoolarYearAction } from '../find-schoolar-year/find-schoolar-year.action';

@Injectable()
export class UpdateSchoolarYearAction {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
    @InjectRepository(Lapse)
    private lapseRepository: Repository<Lapse>,
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
    private updateDateValidationHelper: UpdateDateValidationHelper,
    private findSchoolarYearAction: FindSchoolarYearAction,
  ) {}

  @Transactional()
  async execute(
    id: number,
    updateSchoolarYearDto: UpdateSchoolarYearDto,
  ): Promise<SchoolarYear> {
    // Verificar que el año escolar existe
    const existingSchoolarYear = await this.findBasicSchoolarYear(id);

    // Validar las fechas
    this.updateDateValidationHelper.validate(updateSchoolarYearDto);

    // Actualizar datos básicos del año escolar
    await this.updateSchoolarYearBasic(
      id,
      existingSchoolarYear,
      updateSchoolarYearDto.schoolarYear,
    );

    // Obtener lapsos existentes
    const existingLapses = await this.findLapsesBySchoolarYear(id);

    // Actualizar, eliminar o crear lapsos
    await this.processLapses(
      existingLapses,
      updateSchoolarYearDto.lapses,
      existingSchoolarYear,
    );

    // Obtener el año escolar actualizado usando la acción especializada
    return this.findSchoolarYearAction.execute(id);
  }

  private async findBasicSchoolarYear(id: number): Promise<SchoolarYear> {
    const schoolarYear = await this.schoolarYearRepository.findOne({
      where: { id: Equal(id) },
    });

    if (!schoolarYear) {
      throw new NotFoundException(
        `El año escolar con el ID ${id} no fue encontrado`,
      );
    }

    return schoolarYear;
  }

  private async updateSchoolarYearBasic(
    id: number,
    existingSchoolarYear: SchoolarYear,
    updatedData: Partial<SchoolarYear>,
  ): Promise<void> {
    await this.schoolarYearRepository.update(id, {
      ...existingSchoolarYear,
      ...updatedData,
    });
  }

  private async findLapsesBySchoolarYear(
    schoolarYearId: number,
  ): Promise<Lapse[]> {
    return this.lapseRepository.find({
      relations: ['schoolYear'],
      where: {
        schoolYear: {
          id: Equal(schoolarYearId),
        },
      },
      order: {
        lapseNumber: 'ASC',
      },
    });
  }

  private async processLapses(
    existingLapses: Lapse[],
    updatedLapses: UpdateCreateLapseDto[],
    schoolarYear: SchoolarYear,
  ): Promise<void> {
    // Actualizar o eliminar lapsos existentes
    await Promise.all(
      existingLapses.map(async (existingLapse) => {
        const updatedLapse = updatedLapses.find(
          (lapse) => lapse.lapseNumber === existingLapse.lapseNumber,
        );

        if (updatedLapse) {
          // Actualizar el lapso
          await this.updateLapse(existingLapse, updatedLapse);

          // Procesar los cortes del lapso
          await this.processCourts(existingLapse, updatedLapse.scholarCourts);
        } else {
          // Eliminar el lapso si no está en el arreglo enviado
          await this.lapseRepository.softDelete(existingLapse.id);
        }
      }),
    );

    // Crear nuevos lapsos si es necesario
    await this.createNewLapses(existingLapses, updatedLapses, schoolarYear);
  }

  private async updateLapse(
    existingLapse: Lapse,
    updatedLapseData: UpdateCreateLapseDto,
  ): Promise<void> {
    await this.lapseRepository.update(existingLapse.id, {
      startDate: updatedLapseData.startDate,
      endDate: updatedLapseData.endDate,
      lapseNumber: updatedLapseData.lapseNumber,
    });
  }

  private async processCourts(
    lapse: Lapse,
    updatedCourts: UpdateCreateScholarCourtDto[],
  ): Promise<void> {
    // Obtener los cortes existentes del lapso
    const existingCourts = await this.findCourtsByLapse(lapse.id);

    // Actualizar o eliminar cortes existentes
    await Promise.all(
      existingCourts.map(async (existingCourt) => {
        const updatedCourt = updatedCourts?.find(
          (court) => court.courtNumber === existingCourt.courtNumber,
        );

        if (updatedCourt) {
          // Actualizar el corte existente
          await this.updateCourt(existingCourt, updatedCourt);
        } else {
          // Eliminar el corte si no está en el arreglo enviado
          await this.schoolCourtRepository.softDelete(existingCourt.id);
        }
      }),
    );

    // Crear nuevos cortes si hay más en el arreglo enviado
    await this.createNewCourts(existingCourts, updatedCourts, lapse);
  }

  private async findCourtsByLapse(lapseId: string): Promise<SchoolCourt[]> {
    return this.schoolCourtRepository
      .createQueryBuilder('court')
      .leftJoinAndSelect('court.lapse', 'lapse')
      .where('court.lapseId = :lapseId', { lapseId })
      .orderBy('court.courtNumber', 'ASC')
      .getMany();
  }

  private async updateCourt(
    existingCourt: SchoolCourt,
    updatedCourtData: UpdateCreateScholarCourtDto,
  ): Promise<void> {
    await this.schoolCourtRepository.update(existingCourt.id, {
      startDate: updatedCourtData.startDate,
      endDate: updatedCourtData.endDate,
      courtNumber: updatedCourtData.courtNumber,
    });
  }

  private async createNewCourts(
    existingCourts: SchoolCourt[],
    updatedCourts: UpdateCreateScholarCourtDto[],
    lapse: Lapse,
  ): Promise<void> {
    if (!updatedCourts || updatedCourts.length === 0) {
      return;
    }

    const existingCourtNumbers = existingCourts.map(
      (court) => court.courtNumber,
    );

    const newCourts = updatedCourts
      .filter((court) => !existingCourtNumbers.includes(court.courtNumber))
      .map((court) => {
        return this.schoolCourtRepository.create({
          ...court,
          lapse,
        });
      });

    if (newCourts && newCourts.length > 0) {
      await this.schoolCourtRepository.save(newCourts);
    }
  }

  private async createNewLapses(
    existingLapses: Lapse[],
    updatedLapses: UpdateCreateLapseDto[],
    schoolarYear: SchoolarYear,
  ): Promise<void> {
    if (updatedLapses.length === 0) {
      return;
    }

    const existingLapseNumbers = existingLapses.map(
      (lapse) => lapse.lapseNumber,
    );

    const newLapses = updatedLapses
      .filter((lapse) => !existingLapseNumbers.includes(lapse.lapseNumber))
      .map((lapse) => {
        return this.lapseRepository.create({
          ...lapse,
          schoolYear: schoolarYear,
        });
      });

    if (newLapses.length > 0) {
      const savedLapses = await this.lapseRepository.save(newLapses);

      // Crear cortes para los nuevos lapsos
      for (const lapse of savedLapses) {
        const newCourts = lapse.scholarCourts?.map((court) => {
          return this.schoolCourtRepository.create({
            ...court,
            lapse,
          });
        });

        if (newCourts && newCourts.length > 0) {
          await this.schoolCourtRepository.save(newCourts);
        }
      }
    }
  }
}
