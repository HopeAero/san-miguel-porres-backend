import { Persona } from '@/personas/entities/persona.entity';
import { Representante } from '@/representante/entities/representante.entity';
import {
  Entity,
  ManyToOne,
  DeleteDateColumn,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity()
export class Estudiante {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Persona, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  persona: Relation<Persona>;

  @ManyToOne(() => Representante, (representante) => representante.estudiantes)
  representante: Relation<Representante>;

  @DeleteDateColumn()
  deletedAt: Date;
}
