import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscriptionsService } from './inscriptions.service';
import { InscriptionsController } from './inscriptions.controller';
import { Inscription } from './entities/inscription.entity';
import { CourseInscription } from './entities/course-inscription.entity';
import { CourseSchoolYear } from '../school-year/entities/course-school-year.entity';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import {
  CreateInscriptionAction,
  UpdateInscriptionAction,
  FindInscriptionAction,
  RemoveInscriptionAction,
  PaginateInscriptionAction,
} from './actions';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inscription,
      CourseInscription,
      CourseSchoolYear,
      SchoolYear,
    ]),
  ],
  controllers: [InscriptionsController],
  providers: [
    InscriptionsService,
    CreateInscriptionAction,
    UpdateInscriptionAction,
    FindInscriptionAction,
    RemoveInscriptionAction,
    PaginateInscriptionAction,
  ],
  exports: [InscriptionsService],
})
export class InscriptionsModule {}
