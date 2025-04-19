import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { SchoolLapse } from './school-lapse.entity';

@Entity('school_courts')
export class SchoolCourt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  courtNumber: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @ManyToOne(() => SchoolLapse, (schoolLapse) => schoolLapse.schoolCourts, {
    onDelete: 'RESTRICT',
  })
  schoolLapse: Relation<SchoolLapse>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
