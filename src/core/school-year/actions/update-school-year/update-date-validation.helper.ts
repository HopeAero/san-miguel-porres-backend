import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateSchoolYearDto } from '../../dto/update-school-year.dto';
import { CreateSchoolYearDto } from '../../dto/create-school-year.dto';
import { UpdateInputSchoolLapseDto } from '../../dto/update-input-school-lapse.dto';
import { UpdateInputSchoolCourtDto } from '../../dto/update-input-school-court.dto';

@Injectable()
export class UpdateDateValidationHelper {
  constructor() {}

  public validate(updateSchoolYearDto: UpdateSchoolYearDto): void {
    const { schoolYear, schoolLapses } = updateSchoolYearDto;

    schoolLapses.forEach((schoolLapse, lapseIndex) => {
      this.validateSchoolLapseDates(schoolLapse, schoolYear, lapseIndex);

      schoolLapse.schoolCourts?.forEach((schoolCourt, courtIndex) => {
        this.validateSchoolCourtDates(
          schoolCourt,
          schoolLapse,
          schoolYear,
          lapseIndex,
          courtIndex,
        );
      });
    });
  }

  public validateSchoolLapseDates(
    schoolLapse: UpdateInputSchoolLapseDto,
    schoolYear: CreateSchoolYearDto,
    lapseIndex: number,
  ): void {
    if (
      schoolLapse.startDate < schoolYear.startDate ||
      schoolLapse.endDate > schoolYear.endDate
    ) {
      throw new BadRequestException(
        `El lapso #${lapseIndex + 1} con fechas ${schoolLapse.startDate} - ${schoolLapse.endDate} está fuera del rango del año escolar (${schoolYear.startDate} - ${schoolYear.endDate}).`,
      );
    }

    if (
      schoolLapse.startDate > schoolLapse.endDate ||
      schoolLapse.endDate < schoolLapse.startDate
    ) {
      throw new BadRequestException(
        `El lapso #${lapseIndex + 1} con fechas ${schoolLapse.startDate} - ${schoolLapse.endDate} tiene un rango de fechas inválido.`,
      );
    }
  }

  public validateSchoolCourtDates(
    schoolCourt: UpdateInputSchoolCourtDto,
    schoolLapse: UpdateInputSchoolLapseDto,
    schoolYear: CreateSchoolYearDto,
    lapseIndex: number,
    courtIndex: number,
  ): void {
    if (
      schoolCourt.startDate < schoolLapse.startDate ||
      schoolCourt.endDate > schoolLapse.endDate
    ) {
      throw new BadRequestException(
        `El corte #${courtIndex + 1} del lapso #${lapseIndex + 1} con fechas ${schoolCourt.startDate} - ${schoolCourt.endDate} está fuera del rango del lapso ${schoolLapse.startDate} - ${schoolLapse.endDate}.`,
      );
    }

    if (
      schoolCourt.startDate < schoolYear.startDate ||
      schoolCourt.endDate > schoolYear.endDate
    ) {
      throw new BadRequestException(
        `El corte #${courtIndex + 1} del lapso #${lapseIndex + 1} con fechas ${schoolCourt.startDate} - ${schoolCourt.endDate} está fuera del rango del año escolar (${schoolYear.startDate} - ${schoolYear.endDate}).`,
      );
    }

    if (
      schoolCourt.endDate < schoolCourt.startDate ||
      schoolCourt.startDate > schoolCourt.endDate
    ) {
      throw new BadRequestException(
        `El corte #${courtIndex + 1} del lapso #${lapseIndex + 1} con fechas ${schoolCourt.startDate} - ${schoolCourt.endDate} tiene un rango de fechas inválido.`,
      );
    }
  }
}
