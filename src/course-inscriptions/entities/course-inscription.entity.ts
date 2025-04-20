import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../../core/people/student/entities/student.entity';
import { CourseSchoolYear } from '../../core/school-year/entities/course-school-year.entity';

@Entity({ name: 'course_inscriptions' })
export class CourseInscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  courseSchoolYearId: number;

  @Column({ nullable: true, type: 'float' })
  endQualification: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => CourseSchoolYear)
  @JoinColumn({ name: 'courseSchoolYearId' })
  courseSchoolYear: CourseSchoolYear;
}
