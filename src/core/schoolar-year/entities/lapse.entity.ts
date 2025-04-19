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
import { SchoolarYear } from './schoolar-year.entity';
import { SchoolCourt } from './school-court.entity';

@Entity('lapses')
export class Lapse {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: 1 })
  lapseNumber: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @ManyToOne(() => SchoolarYear, (schoolYear) => schoolYear.lapses, {
    onDelete: 'RESTRICT',
  })
  schoolYear: Relation<SchoolarYear>;

  @OneToMany(() => SchoolCourt, (schoolCourt) => schoolCourt.lapse, {
    cascade: true,
  })
  scholarCourts: Relation<SchoolCourt[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
