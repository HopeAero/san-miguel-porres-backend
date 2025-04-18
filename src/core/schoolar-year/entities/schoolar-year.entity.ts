import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { Lapse } from './lapse.entity';

@Entity('schoolar_years')
export class SchoolarYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'date',
  })
  startDate: string;

  @Column({
    type: 'date',
  })
  endDate: string;

  @OneToMany(() => Lapse, (lapse) => lapse.schoolYear, {
    onDelete: 'CASCADE',
  })
  lapses: Relation<Lapse[]>;

  @DeleteDateColumn()
  deletedAt: Date;
}
