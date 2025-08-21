import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationCourseInscription } from './entities/evaluation-course-inscription.entity';
import { EvaluationsController } from './controllers/evaluations.controller';
import { EvaluationsService } from './services/evaluations.service';
import { SchoolCourt } from '../school-year/entities/school-court.entity';
import { CourseSchoolYear } from '../school-year/entities/course-school-year.entity';
import { CourseInscription } from '../inscriptions/entities/course-inscription.entity';
import { Inscription } from '../inscriptions/entities/inscription.entity';
import { Student } from '../people/student/entities/student.entity';
import { FindStudentsByEvaluationAction } from './services/actions/find-students-by-evaluation.action';
import { UpdateStudentsQualificationsAction } from './services/actions/update-students-qualifications.action';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evaluation,
      SchoolCourt,
      CourseSchoolYear,
      EvaluationCourseInscription,
      CourseInscription,
      Inscription,
      Student,
    ]),
  ],
  controllers: [EvaluationsController],
  providers: [
    EvaluationsService,
    FindStudentsByEvaluationAction,
    UpdateStudentsQualificationsAction,
  ],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
