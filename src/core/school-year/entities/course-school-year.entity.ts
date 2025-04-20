import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Employee } from '../../people/employee/entities/employee.entity';
import { SchoolYear } from './school-year.entity';

@Entity({ name: 'course_school_years' })
export class CourseSchoolYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  grade: number;

  @Column({ nullable: true })
  weeklyHours: number;

  @Column({ nullable: true })
  professorId: number;

  @Column()
  courseId: number;

  @Column()
  schoolYearId: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => SchoolYear, (schoolYear) => schoolYear.courseSchoolYears, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'schoolYearId' })
  schoolYear: Relation<SchoolYear>;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'professorId' })
  professor: Employee;

  @DeleteDateColumn()
  deletedAt: Date;
}
