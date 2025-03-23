import { Person } from '@/core/people/people/entities/person.entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  PrimaryColumn,
} from 'typeorm';

export enum TypeEmployee {
  Professor = 'professor',
  Substitute = 'substitute',
  Worker = 'worker',
}

@Entity()
export class Employee {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'string' })
  employeeType: TypeEmployee;

  @OneToOne(() => Person, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  person: Person;

  @DeleteDateColumn()
  deletedAt: Date;
}
