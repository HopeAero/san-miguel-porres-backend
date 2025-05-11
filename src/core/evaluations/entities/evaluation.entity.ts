import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { CourseSchoolYear } from '../../school-year/entities/course-school-year.entity';
import { SchoolCourt } from '../../school-year/entities/school-court.entity';
import { EvaluationType } from './evaluation-type.enum';

/**
 * Entidad que representa una evaluación en un curso escolar
 */
@Entity({ name: 'evaluations' })
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  courseSchoolYearId: number;

  @Column()
  schoolCourtId: number;

  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number;

  @Column({
    type: 'enum',
    enum: EvaluationType,
  })
  type: EvaluationType;

  @Column({ nullable: true })
  correlative: number;

  @Column({ type: 'date', nullable: true })
  projectedDate: Date;

  @ManyToOne(() => CourseSchoolYear)
  @JoinColumn({ name: 'courseSchoolYearId' })
  courseSchoolYear: CourseSchoolYear;

  @ManyToOne(() => SchoolCourt)
  @JoinColumn({ name: 'schoolCourtId' })
  schoolCourt: SchoolCourt;

  @CreateDateColumn()
  creationDate: Date;

  @DeleteDateColumn()
  deletedAt: Date;
} 