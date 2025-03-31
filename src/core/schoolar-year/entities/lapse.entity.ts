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
import { SchoolarYear } from './schoolar-year.entity';

@Entity('lapses')
export class Lapse {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    default: 1,
  })
  lapseNumber: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => SchoolarYear, (schoolYear) => schoolYear.lapses, {
    onDelete: 'RESTRICT',
  })
  schoolYear: Relation<SchoolarYear>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
