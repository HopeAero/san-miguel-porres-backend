import { Injectable } from '@nestjs/common';
import { UpdateSchoolYearDto } from '../../dto/update-school-year.dto';
import { SchoolYear } from '../../entities/school-year.entity';
import { Transactional } from 'typeorm-transactional';
import { UpdateDateValidationHelper } from './update-date-validation.helper';
import { FindSchoolYearAction } from '../find-school-year/find-school-year.action';
import { UpdateSchoolYearBasicAction } from './update-school-year-basic.action';
import { UpdateSchoolLapsesAction } from './update-school-lapses.action';
import { UpdateCourseSchoolYearsAction } from './update-course-school-years.action';

@Injectable()
export class UpdateSchoolYearAction {
  constructor(
    private updateDateValidationHelper: UpdateDateValidationHelper,
    private findSchoolYearAction: FindSchoolYearAction,
    private updateSchoolYearBasicAction: UpdateSchoolYearBasicAction,
    private updateSchoolLapsesAction: UpdateSchoolLapsesAction,
    private updateCourseSchoolYearsAction: UpdateCourseSchoolYearsAction,
  ) {}

  @Transactional()
  async execute(
    id: number,
    updateSchoolYearDto: UpdateSchoolYearDto,
  ): Promise<SchoolYear> {
    // Validar las fechas
    this.updateDateValidationHelper.validate(updateSchoolYearDto);

    // Actualizar datos básicos del año escolar
    const existingSchoolYear = await this.updateSchoolYearBasicAction.execute(
      id,
      updateSchoolYearDto.schoolYear,
    );

    // Actualizar, eliminar o crear lapsos y sus cortes
    await this.updateSchoolLapsesAction.execute(
      existingSchoolYear,
      updateSchoolYearDto.schoolLapses,
    );

    // Actualizar, eliminar o crear asignaturas asociadas al año escolar
    if (updateSchoolYearDto.courseSchoolYears) {
      await this.updateCourseSchoolYearsAction.execute(
        existingSchoolYear.id,
        updateSchoolYearDto.courseSchoolYears,
      );
    }

    // Obtener el año escolar actualizado usando la acción especializada
    return this.findSchoolYearAction.execute(id);
  }
}
