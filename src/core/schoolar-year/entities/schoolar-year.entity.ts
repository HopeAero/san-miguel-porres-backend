import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';

@Entity('schoolar_years')
export class SchoolarYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
