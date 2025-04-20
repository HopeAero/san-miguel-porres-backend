import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolCourt } from '../../entities/school-court.entity';
import { SchoolLapse } from '../../entities/school-lapse.entity';
import { UpdateInputSchoolCourtDto } from '../../dto/update-input-school-court.dto';
import { ProcessedSchoolCourtDto } from '../../dto/processed-school-court.dto';

@Injectable()
export class UpdateSchoolCourtsAction {
  constructor(
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
  ) {}

  async execute(
    schoolLapse: SchoolLapse,
    inputSchoolCourts: UpdateInputSchoolCourtDto[] | ProcessedSchoolCourtDto[],
  ): Promise<void> {
    // Obtener los cortes existentes del lapso
    const existingSchoolCourts = await this.findSchoolCourtsBySchoolLapse(
      schoolLapse.id,
    );

    // Procesar los cortes de entrada si aún no están procesados
    let processedCourts: ProcessedSchoolCourtDto[];

    // Determinar si ya están procesados verificando si el primer elemento tiene courtNumber
    if (inputSchoolCourts.length > 0 && 'courtNumber' in inputSchoolCourts[0]) {
      // Ya están procesados
      processedCourts = inputSchoolCourts as ProcessedSchoolCourtDto[];
    } else {
      // Necesitan ser procesados
      processedCourts = this.processCourts(
        inputSchoolCourts as UpdateInputSchoolCourtDto[],
      );
    }

    // Obtener los IDs de los cortes enviados en la actualización
    const updatedCourtIds = processedCourts
      .filter((court) => court.id)
      .map((court) => court.id);

    // 1. Eliminar cortes que ya no están en el payload
    const courtsToDelete = existingSchoolCourts.filter(
      (existingCourt) => !updatedCourtIds.includes(Number(existingCourt.id)),
    );

    if (courtsToDelete.length > 0) {
      await Promise.all(
        courtsToDelete.map(
          async (court) =>
            await this.schoolCourtRepository.softDelete(court.id),
        ),
      );
    }

    // 2. Crear un mapa de cortes existentes para fácil acceso
    const existingCourtMap = new Map<number, SchoolCourt>();
    existingSchoolCourts.forEach((court) => {
      existingCourtMap.set(Number(court.id), court);
    });

    // 3. Procesar cada corte del payload
    for (const processedCourt of processedCourts) {
      if (
        processedCourt.id &&
        existingCourtMap.has(Number(processedCourt.id))
      ) {
        // Es un corte existente, actualizarlo
        const existingCourt = existingCourtMap.get(Number(processedCourt.id));
        await this.updateSchoolCourt(existingCourt, processedCourt);
      } else {
        // Es un nuevo corte, crearlo
        await this.createNewSchoolCourt(processedCourt, schoolLapse);
      }
    }
  }

  /**
   * Procesa los cortes de entrada asignando números secuenciales basados en su posición
   */
  processCourts(
    inputCourts: UpdateInputSchoolCourtDto[],
  ): ProcessedSchoolCourtDto[] {
    return inputCourts.map((inputCourt, index) => {
      // Cada corte tendrá un número basado en su posición en el array (empezando de 1)
      const courtNumber = index + 1;

      // Devolver el corte procesado con su número asignado
      return {
        id: inputCourt.id,
        courtNumber,
        startDate: inputCourt.startDate,
        endDate: inputCourt.endDate,
      };
    });
  }

  private async findSchoolCourtsBySchoolLapse(
    schoolLapseId: string,
  ): Promise<SchoolCourt[]> {
    return this.schoolCourtRepository
      .createQueryBuilder('schoolCourt')
      .leftJoinAndSelect('schoolCourt.schoolLapse', 'schoolLapse')
      .where('schoolCourt.schoolLapseId = :schoolLapseId', { schoolLapseId })
      .getMany();
  }

  private async updateSchoolCourt(
    existingSchoolCourt: SchoolCourt,
    processedCourt: ProcessedSchoolCourtDto,
  ): Promise<void> {
    await this.schoolCourtRepository.update(existingSchoolCourt.id, {
      startDate: processedCourt.startDate,
      endDate: processedCourt.endDate,
      courtNumber: processedCourt.courtNumber,
    });
  }

  private async createNewSchoolCourt(
    processedCourt: ProcessedSchoolCourtDto,
    schoolLapse: SchoolLapse,
  ): Promise<SchoolCourt> {
    // Crear una copia sin el campo id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...courtDataWithoutId } = processedCourt;

    // Crear y guardar el corte
    const newCourt = this.schoolCourtRepository.create({
      ...courtDataWithoutId,
      schoolLapse,
    });

    return this.schoolCourtRepository.save(newCourt);
  }
}
