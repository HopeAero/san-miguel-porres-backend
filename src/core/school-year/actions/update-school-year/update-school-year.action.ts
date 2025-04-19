import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { SchoolYear } from '../../entities/school-year.entity';
import { SchoolLapse } from '../../entities/school-lapse.entity';
import { SchoolCourt } from '../../entities/school-court.entity';
import { UpdateSchoolYearDto } from '../../dto/update-school-year.dto';
import { UpdateCreateSchoolLapseDto } from '../../dto/create-school-lapse.dto';
import { UpdateCreateSchoolCourtDto } from '../../dto/create-school-court.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdateDateValidationHelper } from './update-date-validation.helper';
import { FindSchoolYearAction } from '../find-school-year/find-school-year.action';

@Injectable()
export class UpdateSchoolYearAction {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
    @InjectRepository(SchoolLapse)
    private schoolLapseRepository: Repository<SchoolLapse>,
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
    private updateDateValidationHelper: UpdateDateValidationHelper,
    private findSchoolYearAction: FindSchoolYearAction,
  ) {}

  @Transactional()
  async execute(
    id: number,
    updateSchoolYearDto: UpdateSchoolYearDto,
  ): Promise<SchoolYear> {
    // Verificar que el año escolar existe
    const existingSchoolYear = await this.findBasicSchoolYear(id);

    // Validar las fechas
    this.updateDateValidationHelper.validate(updateSchoolYearDto);

    // Actualizar datos básicos del año escolar
    await this.updateSchoolYearBasic(
      id,
      existingSchoolYear,
      updateSchoolYearDto.schoolYear,
    );

    // Obtener lapsos existentes
    const existingSchoolLapses = await this.findSchoolLapsesBySchoolYear(id);

    // Actualizar, eliminar o crear lapsos
    await this.processSchoolLapses(
      existingSchoolLapses,
      updateSchoolYearDto.schoolLapses,
      existingSchoolYear,
    );

    // Obtener el año escolar actualizado usando la acción especializada
    return this.findSchoolYearAction.execute(id);
  }

  private async findBasicSchoolYear(id: number): Promise<SchoolYear> {
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

  private async updateSchoolYearBasic(
    id: number,
    existingSchoolYear: SchoolYear,
    updatedData: Partial<SchoolYear>,
  ): Promise<void> {
    await this.schoolYearRepository.update(id, {
      ...existingSchoolYear,
      ...updatedData,
    });
  }

  private async findSchoolLapsesBySchoolYear(
    schoolYearId: number,
  ): Promise<SchoolLapse[]> {
    return this.schoolLapseRepository.find({
      relations: ['schoolYear'],
      where: {
        schoolYear: {
          id: Equal(schoolYearId),
        },
      },
      order: {
        lapseNumber: 'ASC',
      },
    });
  }

  private async processSchoolLapses(
    existingSchoolLapses: SchoolLapse[],
    updatedSchoolLapses: UpdateCreateSchoolLapseDto[],
    schoolYear: SchoolYear,
  ): Promise<void> {
    // Actualizar o eliminar lapsos existentes
    await Promise.all(
      existingSchoolLapses.map(async (existingSchoolLapse) => {
        const updatedSchoolLapse = updatedSchoolLapses.find(
          (schoolLapse) =>
            schoolLapse.lapseNumber === existingSchoolLapse.lapseNumber,
        );

        if (updatedSchoolLapse) {
          // Actualizar el lapso
          await this.updateSchoolLapse(existingSchoolLapse, updatedSchoolLapse);

          // Procesar los cortes del lapso
          await this.processSchoolCourts(
            existingSchoolLapse,
            updatedSchoolLapse.schoolCourts,
          );
        } else {
          // Eliminar el lapso si no está en el arreglo enviado
          await this.schoolLapseRepository.softDelete(existingSchoolLapse.id);
        }
      }),
    );

    // Crear nuevos lapsos si es necesario
    await this.createNewSchoolLapses(
      existingSchoolLapses,
      updatedSchoolLapses,
      schoolYear,
    );
  }

  private async updateSchoolLapse(
    existingSchoolLapse: SchoolLapse,
    updatedSchoolLapseData: UpdateCreateSchoolLapseDto,
  ): Promise<void> {
    await this.schoolLapseRepository.update(existingSchoolLapse.id, {
      startDate: updatedSchoolLapseData.startDate,
      endDate: updatedSchoolLapseData.endDate,
      lapseNumber: updatedSchoolLapseData.lapseNumber,
    });
  }

  private async processSchoolCourts(
    schoolLapse: SchoolLapse,
    updatedSchoolCourts: UpdateCreateSchoolCourtDto[],
  ): Promise<void> {
    // Obtener los cortes existentes del lapso
    const existingSchoolCourts = await this.findSchoolCourtsBySchoolLapse(
      schoolLapse.id,
    );

    // Actualizar o eliminar cortes existentes
    await Promise.all(
      existingSchoolCourts.map(async (existingSchoolCourt) => {
        const updatedSchoolCourt = updatedSchoolCourts?.find(
          (schoolCourt) =>
            schoolCourt.courtNumber === existingSchoolCourt.courtNumber,
        );

        if (updatedSchoolCourt) {
          // Actualizar el corte existente
          await this.updateSchoolCourt(existingSchoolCourt, updatedSchoolCourt);
        } else {
          // Eliminar el corte si no está en el arreglo enviado
          await this.schoolCourtRepository.softDelete(existingSchoolCourt.id);
        }
      }),
    );

    // Crear nuevos cortes si hay más en el arreglo enviado
    await this.createNewSchoolCourts(
      existingSchoolCourts,
      updatedSchoolCourts,
      schoolLapse,
    );
  }

  private async findSchoolCourtsBySchoolLapse(
    schoolLapseId: string,
  ): Promise<SchoolCourt[]> {
    return this.schoolCourtRepository
      .createQueryBuilder('schoolCourt')
      .leftJoinAndSelect('schoolCourt.schoolLapse', 'schoolLapse')
      .where('schoolCourt.schoolLapseId = :schoolLapseId', { schoolLapseId })
      .orderBy('schoolCourt.courtNumber', 'ASC')
      .getMany();
  }

  private async updateSchoolCourt(
    existingSchoolCourt: SchoolCourt,
    updatedSchoolCourtData: UpdateCreateSchoolCourtDto,
  ): Promise<void> {
    await this.schoolCourtRepository.update(existingSchoolCourt.id, {
      startDate: updatedSchoolCourtData.startDate,
      endDate: updatedSchoolCourtData.endDate,
      courtNumber: updatedSchoolCourtData.courtNumber,
    });
  }

  private async createNewSchoolCourts(
    existingSchoolCourts: SchoolCourt[],
    updatedSchoolCourts: UpdateCreateSchoolCourtDto[],
    schoolLapse: SchoolLapse,
  ): Promise<void> {
    if (!updatedSchoolCourts || updatedSchoolCourts.length === 0) {
      return;
    }

    const existingSchoolCourtNumbers = existingSchoolCourts.map(
      (schoolCourt) => schoolCourt.courtNumber,
    );

    const newSchoolCourts = updatedSchoolCourts
      .filter(
        (schoolCourt) =>
          !existingSchoolCourtNumbers.includes(schoolCourt.courtNumber),
      )
      .map((schoolCourt) => {
        return this.schoolCourtRepository.create({
          ...schoolCourt,
          schoolLapse,
        });
      });

    if (newSchoolCourts.length > 0) {
      await this.schoolCourtRepository.save(newSchoolCourts);
    }
  }

  private async createNewSchoolLapses(
    existingSchoolLapses: SchoolLapse[],
    updatedSchoolLapses: UpdateCreateSchoolLapseDto[],
    schoolYear: SchoolYear,
  ): Promise<void> {
    if (updatedSchoolLapses.length === 0) {
      return;
    }

    const existingSchoolLapseNumbers = existingSchoolLapses.map(
      (schoolLapse) => schoolLapse.lapseNumber,
    );

    const newSchoolLapses = updatedSchoolLapses
      .filter(
        (schoolLapse) =>
          !existingSchoolLapseNumbers.includes(schoolLapse.lapseNumber),
      )
      .map((schoolLapse) => {
        return this.schoolLapseRepository.create({
          ...schoolLapse,
          schoolYear,
        });
      });

    if (newSchoolLapses.length > 0) {
      const savedSchoolLapses =
        await this.schoolLapseRepository.save(newSchoolLapses);

      // Crear cortes para los nuevos lapsos
      for (const schoolLapse of savedSchoolLapses) {
        const lapseDto = updatedSchoolLapses.find(
          (dto) => dto.lapseNumber === schoolLapse.lapseNumber,
        );

        if (lapseDto?.schoolCourts && lapseDto.schoolCourts.length > 0) {
          const courts: SchoolCourt[] = [];

          for (const courtDto of lapseDto.schoolCourts) {
            const court = this.schoolCourtRepository.create({
              ...courtDto,
              schoolLapse,
            });
            courts.push(court);
          }

          if (courts.length > 0) {
            await this.schoolCourtRepository.save(courts);
          }
        }
      }
    }
  }
}
