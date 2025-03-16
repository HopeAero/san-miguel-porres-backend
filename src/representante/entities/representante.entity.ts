import { Estudiante } from '@/estudiante/entities/estudiante.entity';
import { Persona } from '@/personas/entities/persona.entity';
import {
  Entity,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Representante {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Persona, { cascade: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  persona: Persona;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.representante)
  estudiantes: Estudiante[];

  @DeleteDateColumn()
  deletedAt: Date;
}
