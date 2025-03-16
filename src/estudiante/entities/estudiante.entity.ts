import { Entity, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from 'typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { Representante } from '../representante/entities/representante.entity';

@Entity()
export class Estudiante {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @ManyToOne(() => Persona, (persona) => persona.estudiantes) // Many-to-one relationship with Persona
  persona: Persona;

  @ManyToOne(() => Representante, (representante) => representante.estudiantes) // Many-to-one relationship with Representante
  representante: Representante;

  @DeleteDateColumn() // Column for soft-delete (stores the deletion timestamp)
  deletedAt: Date;
}