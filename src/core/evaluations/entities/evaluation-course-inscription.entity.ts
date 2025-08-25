import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Evaluation } from './evaluation.entity';
import { CourseInscription } from '../../inscriptions/entities/course-inscription.entity';

/**
 * Entidad que representa la relación entre una evaluación y la inscripción de un estudiante en un curso
 * Almacena la calificación obtenida por el estudiante en una evaluación específica
 */
@Entity({ name: 'evaluations_course_inscriptions' })
export class EvaluationCourseInscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  evaluationId: number;

  @Column()
  courseInscriptionId: number;

  /**
   * Calificación obtenida por el estudiante en la evaluación
   * Puede ser nula si aún no se ha asignado una calificación
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  qualification: number | null;

  /**
   * Fecha en que se registró la calificación
   * Puede ser nula si aún no se ha asignado una calificación
   */
  @Column({ type: 'date', nullable: true })
  qualificationDate: Date | null;

  /**
   * Indica si el estudiante no presentó la evaluación
   * true = No presentó, false = Presentó o aún no se determina
   */
  @Column({ default: false })
  didNotPresent: boolean;

  /**
   * Relación con la entidad Evaluation
   */
  @ManyToOne(() => Evaluation)
  @JoinColumn({ name: 'evaluationId' })
  evaluation: Evaluation;

  /**
   * Relación con la entidad CourseInscription
   */
  @ManyToOne(() => CourseInscription)
  @JoinColumn({ name: 'courseInscriptionId' })
  courseInscription: CourseInscription;

  @CreateDateColumn()
  creationDate: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
