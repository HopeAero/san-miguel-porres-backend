import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseSchoolYear } from '../../school-year/entities/course-school-year.entity';
import { Inscription } from './inscription.entity';

@Entity({ name: 'course_inscriptions' })
export class CourseInscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseSchoolYearId: number;

  @Column()
  inscriptionId: number;

  @ManyToOne(() => CourseSchoolYear)
  @JoinColumn({ name: 'courseSchoolYearId' })
  courseSchoolYear: CourseSchoolYear;

  @ManyToOne(() => Inscription, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'inscriptionId' })
  inscription: Inscription;

  @DeleteDateColumn()
  deletedAt: Date;
}
