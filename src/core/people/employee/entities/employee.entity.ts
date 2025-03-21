import { Person } from '@/core/people/people/entities/person.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum TypeEmployee {
  Professor = 'professor',
  Worker = 'worker',
}

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: [TypeEmployee.Professor, TypeEmployee.Worker] })
  employeeType: TypeEmployee;

  @OneToOne(() => Person, { cascade: true })
  @JoinColumn()
  person: Person;

  @DeleteDateColumn()
  deletedAt: Date;
}
