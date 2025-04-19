import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateSchoolarYearDto } from '../../dto/update-schoolar-year.dto';
import { UpdateCreateLapseDto } from '../../dto/create-lapse.dto';
import { UpdateCreateScholarCourtDto } from '../../dto/create-scholar-court.dto';
import { CreateSchoolarYearDto } from '../../dto/create-schoolar-year.dto';

@Injectable()
export class UpdateDateValidationHelper {
  constructor() {}

  public validate(updateSchoolarYearDto: UpdateSchoolarYearDto): void {
    const { schoolarYear, lapses } = updateSchoolarYearDto;

    lapses.forEach((lapse) => {
      this.validateLapseDates(lapse, schoolarYear);

      lapse.scholarCourts?.forEach((court) => {
        this.validateCourtDates(court, lapse, schoolarYear);
      });
    });
  }

  public validateLapseDates(
    lapse: UpdateCreateLapseDto,
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
    court: UpdateCreateScholarCourtDto,
    lapse: UpdateCreateLapseDto,
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
