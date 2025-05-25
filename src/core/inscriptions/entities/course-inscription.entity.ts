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

/**
 * Enum para describir el tipo de intento de un estudiante en un curso
 * - normal-attempt: Cuando un estudiante ve la materia por primera vez
 * - full-grade-repeater: Estudiante que repitió por completo el año o grado y debe ver todas las materias
 * - course-repeater: Estudiante que está repitiendo el curso específico pero no todo el grado
 */
export enum AttemptType {
  NORMAL_ATTEMPT = 'normal-attempt',
  FULL_GRADE_REPEATER = 'full-grade-repeater',
  COURSE_REPEATER = 'course-repeater',
}

@Entity({ name: 'course_inscriptions' })
export class CourseInscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseSchoolYearId: number;

  @Column()
  inscriptionId: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  endQualification: number | null;

  /**
   * Número de intento del estudiante en el curso
   * Se deja por si se llega a necesitar pero posiblemente no se use
   * @default 0
   */
  @Column({ default: 0 })
  attemptNumber: number;

  /**
   * Tipo de intento del estudiante en el curso
   * Se deja por si se llega a necesitar pero posiblemente no se use
   * @default 'normal-attempt'
   */
  @Column({
    type: 'enum',
    enum: AttemptType,
    default: AttemptType.NORMAL_ATTEMPT,
  })
  attemptType: AttemptType;

  @ManyToOne(() => CourseSchoolYear)
  @JoinColumn({ name: 'courseSchoolYearId' })
  courseSchoolYear: CourseSchoolYear;

  @ManyToOne(() => Inscription, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'inscriptionId' })
  inscription: Inscription;

  @DeleteDateColumn()
  deletedAt: Date;
}
