import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCrudOfCrudSchoolarYearDto } from '../../dto/create-crud-of-crud.dto';
import { CreateLapseDto } from '../../dto/create-lapse.dto';
import { CreateSchoolarYearDto } from '../../dto/create-schoolar-year.dto';
import { CreateScholarCourtDto } from '../../dto/create-scholar-court.dto';

@Injectable()
export class CreationDateValidationHelper {
  constructor() {}

  public validate(
    createCrudOfCrudSchoolarDto: CreateCrudOfCrudSchoolarYearDto,
  ): void {
    const { schoolarYear, lapses } = createCrudOfCrudSchoolarDto;

    lapses.forEach((lapse) => {
      this.validateLapseDates(lapse, schoolarYear);

      lapse.scholarCourts?.forEach((court) => {
        this.validateCourtDates(court, lapse, schoolarYear);
      });
    });
  }

  public validateLapseDates(
    lapse: CreateLapseDto,
    schoolarYear: CreateSchoolarYearDto,
  ): void {
    if (
      lapse.startDate < schoolarYear.startDate ||
      lapse.endDate > schoolarYear.endDate
    ) {
      throw new BadRequestException(
        `El lapso con fechas ${lapse.startDate} - ${lapse.endDate} está fuera del rango del año escolar (${schoolarYear.startDate} - ${schoolarYear.endDate}).`,
      );
    }

    if (lapse.startDate > lapse.endDate || lapse.endDate < lapse.startDate) {
      throw new BadRequestException(
        `El lapso con fechas ${lapse.startDate} - ${lapse.endDate} tiene un rango de fechas inválido.`,
      );
    }
  }

  public validateCourtDates(
    court: CreateScholarCourtDto,
    lapse: CreateLapseDto,
    schoolarYear: CreateSchoolarYearDto,
  ): void {
    if (court.startDate < lapse.startDate || court.endDate > lapse.endDate) {
      throw new BadRequestException(
        `El corte con fechas ${court.startDate} - ${court.endDate} está fuera del rango del lapso ${lapse.startDate} - ${lapse.endDate}.`,
      );
    }

    if (
      court.startDate < schoolarYear.startDate ||
      court.endDate > schoolarYear.endDate
    ) {
      throw new BadRequestException(
        `El corte con fechas ${court.startDate} - ${court.endDate} está fuera del rango del año escolar (${schoolarYear.startDate} - ${schoolarYear.endDate}).`,
      );
    }

    if (court.endDate < court.startDate || court.startDate > court.endDate) {
      throw new BadRequestException(
        `El corte con fechas ${court.startDate} - ${court.endDate} tiene un rango de fechas inválido.`,
      );
    }
  }
}
