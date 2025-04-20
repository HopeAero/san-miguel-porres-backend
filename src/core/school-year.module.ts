import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolYear } from './school-year/entities/school-year.entity';
import { SchoolLapse } from './school-year/entities/school-lapse.entity';
import { SchoolCourt } from './school-year/entities/school-court.entity';
import { CourseSchoolYear } from './school-year/entities/course-school-year.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolYear,
      SchoolLapse,
      SchoolCourt,
      CourseSchoolYear,
    ]),
  ],
  // ... rest of the module ...
})
export class SchoolYearModule {}
