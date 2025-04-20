import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolYear } from './entities/school-year.entity';
import { SchoolYearService } from './school-year.service';
import { SchoolYearController } from './school-year.controller';
import { SchoolLapse } from './entities/school-lapse.entity';
import { SchoolCourt } from './entities/school-court.entity';
import { CourseSchoolYear } from './entities/course-school-year.entity';
import { Course } from '../courses/entities/course.entity';
import {
  CreateSchoolYearAction,
  FindSchoolYearAction,
  RemoveSchoolYearAction,
  UpdateSchoolYearAction,
  UpdateDateValidationHelper,
  CreationDateValidationHelper,
  UpdateSchoolYearBasicAction,
  UpdateSchoolLapsesAction,
  UpdateSchoolCourtsAction,
} from './actions';
import { CreateCourseSchoolYearsAction } from './actions/create-school-year/create-course-school-years.action';
import { UpdateCourseSchoolYearsAction } from './actions/update-school-year/update-course-school-years.action';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolYear,
      SchoolLapse,
      SchoolCourt,
      Course,
      CourseSchoolYear,
    ]),
  ],
  controllers: [SchoolYearController],
  providers: [
    SchoolYearService,
    CreateSchoolYearAction,
    FindSchoolYearAction,
    RemoveSchoolYearAction,
    UpdateSchoolYearAction,
    UpdateDateValidationHelper,
    CreationDateValidationHelper,
    UpdateSchoolYearBasicAction,
    UpdateSchoolLapsesAction,
    UpdateSchoolCourtsAction,
    CreateCourseSchoolYearsAction,
    UpdateCourseSchoolYearsAction,
  ],
  exports: [SchoolYearService],
})
export class SchoolYearModule {}
