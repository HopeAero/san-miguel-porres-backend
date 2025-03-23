import { Person } from '@/core/people/people/entities/person.entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  PrimaryColumn,
  Relation,
} from 'typeorm';

export enum TypeEmployee {
  Professor = 'professor',
  Substitute = 'substitute',
  Worker = 'worker',
}

@Entity({ name: 'employees' })
export class Employee {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'text' })
  employeeType: TypeEmployee;

  @OneToOne(() => Person, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  person: Relation<Person>;

  @DeleteDateColumn()
  deletedAt: Date;
}
