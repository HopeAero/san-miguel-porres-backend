import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCrudSchoolYearDto } from '../../dto/create-crud-school-year.dto';
import { CreateSchoolLapseDto } from '../../dto/create-school-lapse.dto';
import { CreateSchoolYearDto } from '../../dto/create-school-year.dto';
import { CreateSchoolCourtDto } from '../../dto/create-school-court.dto';

@Injectable()
export class CreationDateValidationHelper {
  constructor() {}

  public validate(createCrudSchoolYearDto: CreateCrudSchoolYearDto): void {
    const { schoolYear, schoolLapses } = createCrudSchoolYearDto;

    schoolLapses.forEach((schoolLapse) => {
      this.validateSchoolLapseDates(schoolLapse, schoolYear);

      schoolLapse.schoolCourts?.forEach((schoolCourt) => {
        this.validateSchoolCourtDates(schoolCourt, schoolLapse, schoolYear);
      });
    });
  }

  public validateSchoolLapseDates(
    schoolLapse: CreateSchoolLapseDto,
    schoolYear: CreateSchoolYearDto,
  ): void {
    if (
      schoolLapse.startDate < schoolYear.startDate ||
      schoolLapse.endDate > schoolYear.endDate
    ) {
      throw new BadRequestException(
        `El lapso con fechas ${schoolLapse.startDate} - ${schoolLapse.endDate} está fuera del rango del año escolar (${schoolYear.startDate} - ${schoolYear.endDate}).`,
      );
    }

    if (
      schoolLapse.startDate > schoolLapse.endDate ||
      schoolLapse.endDate < schoolLapse.startDate
    ) {
      throw new BadRequestException(
        `El lapso con fechas ${schoolLapse.startDate} - ${schoolLapse.endDate} tiene un rango de fechas inválido.`,
      );
    }
  }

  public validateSchoolCourtDates(
    schoolCourt: CreateSchoolCourtDto,
    schoolLapse: CreateSchoolLapseDto,
    schoolYear: CreateSchoolYearDto,
  ): void {
    if (
      schoolCourt.startDate < schoolLapse.startDate ||
      schoolCourt.endDate > schoolLapse.endDate
    ) {
      throw new BadRequestException(
        `El corte con fechas ${schoolCourt.startDate} - ${schoolCourt.endDate} está fuera del rango del lapso ${schoolLapse.startDate} - ${schoolLapse.endDate}.`,
      );
    }

    if (
      schoolCourt.startDate < schoolYear.startDate ||
      schoolCourt.endDate > schoolYear.endDate
    ) {
      throw new BadRequestException(
        `El corte con fechas ${schoolCourt.startDate} - ${schoolCourt.endDate} está fuera del rango del año escolar (${schoolYear.startDate} - ${schoolYear.endDate}).`,
      );
    }

    if (
      schoolCourt.endDate < schoolCourt.startDate ||
      schoolCourt.startDate > schoolCourt.endDate
    ) {
      throw new BadRequestException(
        `El corte con fechas ${schoolCourt.startDate} - ${schoolCourt.endDate} tiene un rango de fechas inválido.`,
      );
    }
  }
}
