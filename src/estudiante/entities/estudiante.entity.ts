import { Persona } from '@/personas/entities/persona.entity';
import { Representante } from '@/representante/entities/representante.entity';
import {
  Entity,
  ManyToOne,
  DeleteDateColumn,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Estudiante {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Persona, { cascade: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  persona: Persona;

  @ManyToOne(() => Representante, (representante) => representante.estudiantes)
  representante: Representante;

  @DeleteDateColumn()
  deletedAt: Date;
}
