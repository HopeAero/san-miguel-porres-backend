import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolYear } from './entities/school-year.entity';
import { SchoolYearService } from './school-year.service';
import { SchoolYearController } from './school-year.controller';
import { SchoolLapse } from './entities/school-lapse.entity';
import { SchoolCourt } from './entities/school-court.entity';
import {
  CreateSchoolYearAction,
  FindSchoolYearAction,
  RemoveSchoolYearAction,
  UpdateSchoolYearAction,
  UpdateDateValidationHelper,
  CreationDateValidationHelper,
} from './actions';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolYear, SchoolLapse, SchoolCourt])],
  controllers: [SchoolYearController],
  providers: [
    SchoolYearService,
    CreateSchoolYearAction,
    FindSchoolYearAction,
    RemoveSchoolYearAction,
    UpdateSchoolYearAction,
    UpdateDateValidationHelper,
    CreationDateValidationHelper,
  ],
  exports: [SchoolYearService],
})
export class SchoolYearModule {}
