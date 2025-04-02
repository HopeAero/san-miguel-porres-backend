import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Lapse, (lapse) => lapse.scholarCourts, {
    onDelete: 'RESTRICT',
  })
  lapse: Lapse;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
