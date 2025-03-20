import { Persona } from '@/peopleModule/personas/entities/persona.entity';
import { Representante } from '@/peopleModule/representante/entities/representante.entity';
import {
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity()
export class Student {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Persona, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  persona: Relation<Persona>;

  @ManyToOne(() => Representante, (representante) => representante.student)
  representante: Relation<Representante>;

  @DeleteDateColumn()
  deletedAt: Date;
}
