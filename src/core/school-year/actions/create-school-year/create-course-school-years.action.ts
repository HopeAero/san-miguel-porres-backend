import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSchoolYear } from '../../../school-year/entities/course-school-year.entity';
import { CourseSchoolYearDto } from '../../../school-year/dto/course-school-year.dto';

@Injectable()
export class CreateCourseSchoolYearsAction {
  constructor(
    @InjectRepository(CourseSchoolYear)
    private courseSchoolYearRepository: Repository<CourseSchoolYear>,
  ) {}

  /**
   * Crea las asignaturas asociadas a un año escolar
   */
  async execute(
    schoolYearId: number,
    courseSchoolYears: CourseSchoolYearDto[] = [],
  ): Promise<CourseSchoolYear[]> {
    if (!courseSchoolYears.length) {
      return [];
    }

    // Crear entidades de asignaturas
    const courseSchoolYearEntities = courseSchoolYears.map((dto) => {
      return this.courseSchoolYearRepository.create({
        grade: dto.grade,
        weeklyHours: dto.weeklyHours,
        professorId: dto.professorId,
        courseId: dto.courseId,
        schoolYearId,
      });
    });

    // Guardar las asignaturas
    return this.courseSchoolYearRepository.save(courseSchoolYearEntities);
  }
}
