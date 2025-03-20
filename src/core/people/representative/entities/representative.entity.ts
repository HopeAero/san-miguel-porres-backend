import { Person } from '@/people/people/entities/person.entity';
import { Student } from '@/people/student/entities/student.entity';
import {
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity({
  name: 'representatives',
})
export class Representative {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Person, { cascade: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  person: Relation<Person>;

  @OneToMany(() => Student, (student) => student.representative)
  students: Relation<Student[]>;

  @DeleteDateColumn()
  deletedAt: Date;
}
