import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolYear } from '../../entities/school-year.entity';

@Injectable()
export class FindSchoolYearAction {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
  ) {}

  /**
   * Encuentra un año escolar por su ID, incluyendo sus lapsos, cortes y asignaturas
   * @param id El ID del año escolar a buscar
   * @returns El año escolar con sus lapsos, cortes y asignaturas
   * @throws NotFoundException si el año escolar no existe
   */
  async execute(id: number): Promise<SchoolYear> {
    const schoolYear = await this.schoolYearRepository
      .createQueryBuilder('schoolYear')
      .leftJoinAndSelect('schoolYear.schoolLapses', 'schoolLapse')
      .leftJoinAndSelect('schoolLapse.schoolCourts', 'schoolCourt')
      .leftJoinAndSelect('schoolYear.courseSchoolYears', 'courseSchoolYear')
      .leftJoinAndSelect('courseSchoolYear.course', 'course')
      .leftJoinAndSelect('courseSchoolYear.professor', 'professor')
      .where('schoolYear.id = :id', { id })
      .getOne();

    if (!schoolYear) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }

    return schoolYear;
  }
}
