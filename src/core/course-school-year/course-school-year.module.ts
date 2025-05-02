import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSchoolYear } from '../school-year/entities/course-school-year.entity';
import { Course } from '../courses/entities/course.entity';
import { Employee } from '../people/employee/entities/employee.entity';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import { PaginateCourseSchoolYearAction } from './actions/paginate-course-school-year/paginate-course-school-year.action';
import { FindCourseSchoolYearAction } from './actions/find-course-school-year/find-course-school-year.action';
import { CreateCourseSchoolYearAction } from './actions/create-course-school-year/create-course-school-year.action';
import { UpdateCourseSchoolYearAction } from './actions/update-course-school-year/update-course-school-year.action';
import { RemoveCourseSchoolYearAction } from './actions/remove-course-school-year/remove-course-school-year.action';
import { CourseSchoolYearService } from './course-school-year.service';
import { CourseSchoolYearController } from './course-school-year.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseSchoolYear,
      Course,
      SchoolYear,
      Employee,
    ]),
  ],
  controllers: [CourseSchoolYearController],
  providers: [
    CourseSchoolYearService,
    PaginateCourseSchoolYearAction,
    FindCourseSchoolYearAction,
    CreateCourseSchoolYearAction,
    UpdateCourseSchoolYearAction,
    RemoveCourseSchoolYearAction,
  ],
  exports: [
    CourseSchoolYearService,
    PaginateCourseSchoolYearAction,
    FindCourseSchoolYearAction,
    CreateCourseSchoolYearAction,
    UpdateCourseSchoolYearAction,
    RemoveCourseSchoolYearAction,
  ],
})
export class CourseSchoolYearModule {} 