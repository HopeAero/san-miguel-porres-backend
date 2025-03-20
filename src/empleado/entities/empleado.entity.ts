import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Persona } from '../persona/entities/persona.entity';

@Entity()
export class Empleado {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column({ type: 'enum', enum: ['Profesor', 'Obrero'] }) // Enum for tipo
  tipo: 'Profesor' | 'Obrero';

  @OneToOne(() => Persona, { cascade: true }) // One-to-one relationship with Persona
  @JoinColumn() // Join column to specify the foreign key
  persona: Persona;

  @DeleteDateColumn() // Column for soft-delete (stores the deletion timestamp)
  deletedAt: Date;
}