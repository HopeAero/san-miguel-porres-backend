import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { SchoolarYear } from '../../entities/schoolar-year.entity';
import { Lapse } from '../../entities/lapse.entity';
import { Transactional } from 'typeorm-transactional';
import { SchoolCourt } from '../../entities/school-court.entity';
import { CreateCrudOfCrudSchoolarYearDto } from '../../dto/create-crud-of-crud.dto';
import { CreateLapseDto } from '../../dto/create-lapse.dto';
import { CreateSchoolarYearDto } from '../../dto/create-schoolar-year.dto';
import { CreateScholarCourtDto } from '../../dto/create-scholar-court.dto';
import { CreationDateValidationHelper } from './creation-date-validation.helper';

@Injectable()
export class CreateSchoolarYearAction {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
    @InjectRepository(Lapse)
    private lapseRepository: Repository<Lapse>,
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
    private creationDateValidationHelper: CreationDateValidationHelper,
  ) {}

  @Transactional()
  async execute(
    createCrudOfCrudSchoolarDto: CreateCrudOfCrudSchoolarYearDto,
  ): Promise<SchoolarYear> {
    const { schoolarYear, lapses } = createCrudOfCrudSchoolarDto;

    // Validar la creación del año escolar y los lapsos
    await this.validateCreation(createCrudOfCrudSchoolarDto);

    // Crear y guardar el año escolar
    const newSchoolarYear = await this.createSchoolarYear(schoolarYear);

    // Crear y guardar lapsos y sus cortes de forma secuencial
    let lapseNumber = 1;
    for (const lapse of lapses) {
      await this.createLapseWithCourts(lapse, lapseNumber, newSchoolarYear);
      lapseNumber++;
    }

    return newSchoolarYear;
  }

  private async createLapseWithCourts(
    lapse: CreateLapseDto,
    lapseNumber: number,
    schoolYear: SchoolarYear,
  ): Promise<void> {
    // Crear y guardar el lapso
    const savedLapse = await this.createLapse(lapse, lapseNumber, schoolYear);

    // Crear y guardar los cortes asociados al lapso
    if (lapse.scholarCourts && lapse.scholarCourts.length > 0) {
      let scholarCourtNumber = 1;

      for (const court of lapse.scholarCourts) {
        await this.createScholarCourt(court, savedLapse, scholarCourtNumber);
        scholarCourtNumber++;
      }
    }
  }

  private async createSchoolarYear(
    createSchoolarYearDto: CreateSchoolarYearDto,
  ): Promise<SchoolarYear> {
    const newSchoolarYear = this.schoolarYearRepository.create(
      createSchoolarYearDto,
    );
    return this.schoolarYearRepository.save(newSchoolarYear);
  }

  private async createLapse(
    createLapseDto: CreateLapseDto,
    lapseNumber: number,
    schoolYear: SchoolarYear,
  ): Promise<Lapse> {
    const newLapse = this.lapseRepository.create({
      ...createLapseDto,
      lapseNumber,
      schoolYear,
    });
    return this.lapseRepository.save(newLapse);
  }

  private async createScholarCourt(
    createScholarCourtDto: CreateScholarCourtDto,
    lapse: Lapse,
    courtNumber: number,
  ): Promise<SchoolCourt> {
    const newScholarCourt = this.schoolCourtRepository.create({
      ...createScholarCourtDto,
      courtNumber,
      lapse,
    });
    return this.schoolCourtRepository.save(newScholarCourt);
  }

  private async validateCreation(
    createCrudOfCrudSchoolarDto: CreateCrudOfCrudSchoolarYearDto,
  ): Promise<void> {
    await this.validateAlreadyExistsSchoolarYear(
      createCrudOfCrudSchoolarDto.schoolarYear.code,
    );
    this.creationDateValidationHelper.validate(createCrudOfCrudSchoolarDto);
  }

  private async validateAlreadyExistsSchoolarYear(code: string): Promise<void> {
    const existingSchoolarYear = await this.schoolarYearRepository.findOne({
      where: {
        code: Equal(code),
      },
    });

    if (existingSchoolarYear) {
      throw new NotFoundException(
        `El año escolar con el código ${code} ya existe`,
      );
    }
  }
}
