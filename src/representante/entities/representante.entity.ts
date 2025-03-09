import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Persona } from './persona.entity'; // I have to create this

@Entity()
export class Representante {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @OneToOne(() => Persona, { cascade: true }) // One-to-one relationship with Persona
  @JoinColumn() // Join column to specify the foreign key
  persona: Persona;

  @DeleteDateColumn() // Column for soft-delete (stores the deletion timestamp)
  deletedAt: Date;
}