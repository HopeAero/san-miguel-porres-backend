import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { SchoolYear } from '../../entities/school-year.entity';
import { SchoolLapse } from '../../entities/school-lapse.entity';
import { Transactional } from 'typeorm-transactional';
import { SchoolCourt } from '../../entities/school-court.entity';
import { CreateCrudSchoolYearDto } from '../../dto/create-crud-school-year.dto';
import { CreateSchoolLapseDto } from '../../dto/create-school-lapse.dto';
import { CreateSchoolYearDto } from '../../dto/create-school-year.dto';
import { CreateSchoolCourtDto } from '../../dto/create-school-court.dto';
import { CreationDateValidationHelper } from './creation-date-validation.helper';

@Injectable()
export class CreateSchoolYearAction {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
    @InjectRepository(SchoolLapse)
    private schoolLapseRepository: Repository<SchoolLapse>,
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
    private creationDateValidationHelper: CreationDateValidationHelper,
  ) {}

  @Transactional()
  async execute(
    createCrudSchoolYearDto: CreateCrudSchoolYearDto,
  ): Promise<SchoolYear> {
    const { schoolYear, schoolLapses } = createCrudSchoolYearDto;

    // Validar la creación del año escolar y los lapsos
    await this.validateCreation(createCrudSchoolYearDto);

    // Crear y guardar el año escolar
    const newSchoolYear = await this.createSchoolYear(schoolYear);

    // Crear y guardar lapsos y sus cortes de forma secuencial
    let lapseNumber = 1;
    for (const schoolLapse of schoolLapses) {
      await this.createSchoolLapseWithCourts(
        schoolLapse,
        lapseNumber,
        newSchoolYear,
      );
      lapseNumber++;
    }

    return newSchoolYear;
  }

  private async createSchoolLapseWithCourts(
    schoolLapse: CreateSchoolLapseDto,
    lapseNumber: number,
    schoolYear: SchoolYear,
  ): Promise<void> {
    // Crear y guardar el lapso
    const savedSchoolLapse = await this.createSchoolLapse(
      schoolLapse,
      lapseNumber,
      schoolYear,
    );

    // Crear y guardar los cortes asociados al lapso
    if (schoolLapse.schoolCourts && schoolLapse.schoolCourts.length > 0) {
      let schoolCourtNumber = 1;

      for (const schoolCourt of schoolLapse.schoolCourts) {
        await this.createSchoolCourt(
          schoolCourt,
          savedSchoolLapse,
          schoolCourtNumber,
        );
        schoolCourtNumber++;
      }
    }
  }

  private async createSchoolYear(
    createSchoolYearDto: CreateSchoolYearDto,
  ): Promise<SchoolYear> {
    const newSchoolYear = this.schoolYearRepository.create(createSchoolYearDto);
    return this.schoolYearRepository.save(newSchoolYear);
  }

  private async createSchoolLapse(
    createSchoolLapseDto: CreateSchoolLapseDto,
    lapseNumber: number,
    schoolYear: SchoolYear,
  ): Promise<SchoolLapse> {
    const newSchoolLapse = this.schoolLapseRepository.create({
      ...createSchoolLapseDto,
      lapseNumber,
      schoolYear,
    });
    return this.schoolLapseRepository.save(newSchoolLapse);
  }

  private async createSchoolCourt(
    createSchoolCourtDto: CreateSchoolCourtDto,
    schoolLapse: SchoolLapse,
    courtNumber: number,
  ): Promise<SchoolCourt> {
    const newSchoolCourt = this.schoolCourtRepository.create({
      ...createSchoolCourtDto,
      courtNumber,
      schoolLapse,
    });
    return this.schoolCourtRepository.save(newSchoolCourt);
  }

  private async validateCreation(
    createCrudSchoolYearDto: CreateCrudSchoolYearDto,
  ): Promise<void> {
    await this.validateAlreadyExistsSchoolYear(
      createCrudSchoolYearDto.schoolYear.code,
    );
    this.creationDateValidationHelper.validate(createCrudSchoolYearDto);
  }

  private async validateAlreadyExistsSchoolYear(code: string): Promise<void> {
    const existingSchoolYear = await this.schoolYearRepository.findOne({
      where: {
        code: Equal(code),
      },
    });

    if (existingSchoolYear) {
      throw new NotFoundException(
        `El año escolar con el código ${code} ya existe`,
      );
    }
  }
}
