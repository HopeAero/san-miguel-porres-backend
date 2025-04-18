import { Person } from '@/people/people/entities/person.entity';
import { Representative } from '@/core/people/representative/entities/representative.entity';
import {
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity({
  name: 'students',
})
export class Student {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  person: Relation<Person>;

  @ManyToOne(() => Representative, (representative) => representative.students)
  representative: Relation<Representative>;

  @DeleteDateColumn()
  deletedAt: Date;
}
