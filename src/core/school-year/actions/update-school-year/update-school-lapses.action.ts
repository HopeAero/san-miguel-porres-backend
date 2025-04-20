import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { SchoolLapse } from '../../entities/school-lapse.entity';
import { SchoolYear } from '../../entities/school-year.entity';
import { UpdateSchoolCourtsAction } from './update-school-courts.action';
import { UpdateInputSchoolLapseDto } from '../../dto/update-input-school-lapse.dto';
import { ProcessedSchoolLapseDto } from '../../dto/processed-school-lapse.dto';
import { UpdateInputSchoolCourtDto } from '../../dto/update-input-school-court.dto';

@Injectable()
export class UpdateSchoolLapsesAction {
  constructor(
    @InjectRepository(SchoolLapse)
    private schoolLapseRepository: Repository<SchoolLapse>,
    private updateSchoolCourtsAction: UpdateSchoolCourtsAction,
  ) {}

  async execute(
    schoolYear: SchoolYear,
    inputSchoolLapses: UpdateInputSchoolLapseDto[],
  ): Promise<void> {
    // Obtener lapsos existentes
    const existingSchoolLapses = await this.findSchoolLapsesBySchoolYear(
      schoolYear.id,
    );

    // Procesar los lapsos de entrada asignando números secuenciales
    const processedLapses = this.processLapses(inputSchoolLapses);

    // Obtener los IDs de los lapsos enviados en la actualización
    const updatedLapseIds = processedLapses
      .filter((lapse) => lapse.id)
      .map((lapse) => lapse.id);

    // 1. Eliminar lapsos que ya no están en el payload
    const lapsesToDelete = existingSchoolLapses.filter(
      (existingLapse) => !updatedLapseIds.includes(Number(existingLapse.id)),
    );

    if (lapsesToDelete.length > 0) {
      await Promise.all(
        lapsesToDelete.map(
          async (lapse) =>
            await this.schoolLapseRepository.softDelete(lapse.id),
        ),
      );
    }

    // 2. Actualizar lapsos existentes
    const existingLapseMap = new Map<number, SchoolLapse>();
    existingSchoolLapses.forEach((lapse) => {
      existingLapseMap.set(Number(lapse.id), lapse);
    });

    // 3. Procesar cada lapso del payload
    for (const processedLapse of processedLapses) {
      if (
        processedLapse.id &&
        existingLapseMap.has(Number(processedLapse.id))
      ) {
        // Es un lapso existente, actualizarlo
        const existingLapse = existingLapseMap.get(Number(processedLapse.id));
        await this.updateSchoolLapse(existingLapse, processedLapse);

        // Procesar los cortes de este lapso
        await this.updateSchoolCourtsAction.execute(
          existingLapse,
          processedLapse.schoolCourts,
        );
      } else {
        // Es un nuevo lapso, crearlo
        await this.createNewSchoolLapse(processedLapse, schoolYear);
      }
    }
  }

  /**
   * Procesa los lapsos de entrada asignando números secuenciales basados en su posición
   */
  private processLapses(
    inputLapses: UpdateInputSchoolLapseDto[],
  ): ProcessedSchoolLapseDto[] {
    return inputLapses.map((inputLapse, index) => {
      // Cada lapso tendrá un número basado en su posición en el array (empezando de 1)
      const lapseNumber = index + 1;

      // Procesar los cortes del lapso si existen
      let processedCourts = [];
      if (inputLapse.schoolCourts && inputLapse.schoolCourts.length > 0) {
        // Procesar los cortes usando el método del UpdateSchoolCourtsAction
        // Pero no los ejecutamos, solo obtenemos los cortes procesados
        processedCourts = this.updateSchoolCourtsAction.processCourts(
          inputLapse.schoolCourts as UpdateInputSchoolCourtDto[],
        );
      }

      // Devolver el lapso procesado con su número asignado
      return {
        id: inputLapse.id,
        lapseNumber,
        startDate: inputLapse.startDate,
        endDate: inputLapse.endDate,
        schoolCourts: processedCourts,
      };
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
    });
  }

  private async updateSchoolLapse(
    existingSchoolLapse: SchoolLapse,
    processedLapse: ProcessedSchoolLapseDto,
  ): Promise<void> {
    await this.schoolLapseRepository.update(existingSchoolLapse.id, {
      startDate: processedLapse.startDate,
      endDate: processedLapse.endDate,
      lapseNumber: processedLapse.lapseNumber,
    });
  }

  private async createNewSchoolLapse(
    processedLapse: ProcessedSchoolLapseDto,
    schoolYear: SchoolYear,
  ): Promise<SchoolLapse> {
    // Extraer los cortes antes de crear el lapso
    const { schoolCourts, ...lapseDataWithoutCourts } = processedLapse;

    // Crear una copia limpia sin id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...cleanLapseData } = lapseDataWithoutCourts;

    // Crear y guardar el lapso
    const newLapse = this.schoolLapseRepository.create(
      cleanLapseData as unknown as SchoolLapse,
    );
    newLapse.schoolYear = schoolYear;

    const savedLapse = await this.schoolLapseRepository.save(newLapse);

    // Crear los cortes para este lapso si existen
    if (schoolCourts && schoolCourts.length > 0) {
      await this.updateSchoolCourtsAction.execute(savedLapse, schoolCourts);
    }

    return savedLapse;
  }
}
