import { Representative } from '@/core/people/representative/entities/representative.entity';
import { Student } from '@/people/student/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'people',
})
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  dni: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column({
    nullable: true,
  })
  phone: string;

  @Column()
  direction: string;

  @Column({
    type: 'date',
  })
  birthDate: Date;

  @OneToOne(() => Representative, (representative) => representative.person, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  representative: Relation<Representative>;

  @OneToOne(() => Student, (student) => student.person, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  student: Relation<Student>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
