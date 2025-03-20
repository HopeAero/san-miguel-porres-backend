import { Persona } from '@/peopleModule/personas/entities/persona.entity';
import { Student } from '@/peopleModule/student/entities/student.entity';
import {
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity()
export class Representante {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Persona, { cascade: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  persona: Relation<Persona>;

  @OneToMany(() => Student, (student) => student.representante)
  student: Relation<Student[]>;

  @DeleteDateColumn()
  deletedAt: Date;
}
