import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleModule } from '../people/people.module';
import { Student } from './entities/student.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Representative } from '../representative/entities/representative.entity';
import { PaginateStudentAction } from './actions';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Representative]),
    forwardRef(() => PeopleModule),
  ],
  controllers: [StudentController],
  providers: [StudentService, PaginateStudentAction],
  exports: [StudentService],
})
export class StudentModule {}
