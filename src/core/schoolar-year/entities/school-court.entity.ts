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
import { Lapse } from './lapse.entity';

@Entity('school_courts')
export class SchoolCourt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 1,
  })
  courtNumber: number;

  @Column({
    type: 'date',
  })
  startDate: string;

  @Column({
    type: 'date',
  })
  endDate: string;

  @ManyToOne(() => Lapse, (lapse) => lapse.scholarCourts, {
    onDelete: 'RESTRICT',
  })
  lapse: Relation<Lapse>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
