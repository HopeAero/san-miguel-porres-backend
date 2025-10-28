import { Person } from '@/core/people/people/entities/person.entity';
import { User } from '@/core/users/entities/user.entity';
import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
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

  @Column({ nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'userId' })
  assignedUser: Relation<User>;

  @OneToOne(() => Person, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  person: Relation<Person>;

  @DeleteDateColumn()
  deletedAt: Date;
}
