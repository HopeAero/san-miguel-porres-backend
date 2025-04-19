import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { SchoolYear } from './school-year.entity';
import { SchoolCourt } from './school-court.entity';

@Entity('school_lapses')
export class SchoolLapse {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: 1 })
  lapseNumber: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @ManyToOne(() => SchoolYear, (schoolYear) => schoolYear.schoolLapses, {
    onDelete: 'RESTRICT',
  })
  schoolYear: Relation<SchoolYear>;

  @OneToMany(() => SchoolCourt, (schoolCourt) => schoolCourt.schoolLapse, {
    cascade: true,
  })
  schoolCourts: Relation<SchoolCourt[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
