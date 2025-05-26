import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationsController } from './controllers/evaluations.controller';
import { EvaluationsService } from './services/evaluations.service';
import { SchoolCourt } from '../school-year/entities/school-court.entity';
import { CourseSchoolYear } from '../school-year/entities/course-school-year.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation, SchoolCourt, CourseSchoolYear]),
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {} 