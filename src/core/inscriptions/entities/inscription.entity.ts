import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SchoolYear } from '../../school-year/entities/school-year.entity';
// Mantenemos import type para evitar la referencia circular
import type { CourseInscription } from './course-inscription.entity';

@Entity({ name: 'inscriptions' })
export class Inscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  schoolYearId: number;

  @Column()
  grade: string;

  @ManyToOne(() => SchoolYear)
  @JoinColumn({ name: 'schoolYearId' })
  schoolYear: SchoolYear;

  // Restauramos el decorador OneToMany pero con 'CourseInscription' como string
  // para evitar la referencia directa y el problema de referencia circular
  @OneToMany('CourseInscription', 'inscription', {
    cascade: true,
  })
  courseInscriptions: CourseInscription[];

  @DeleteDateColumn()
  deletedAt: Date;
}
