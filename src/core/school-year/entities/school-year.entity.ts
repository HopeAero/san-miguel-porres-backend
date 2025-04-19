import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { SchoolLapse } from './school-lapse.entity';

@Entity('school_years')
export class SchoolYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @OneToMany(() => SchoolLapse, (schoolLapse) => schoolLapse.schoolYear, {
    onDelete: 'CASCADE',
  })
  schoolLapses: Relation<SchoolLapse[]>;

  @DeleteDateColumn()
  deletedAt: Date;
}
