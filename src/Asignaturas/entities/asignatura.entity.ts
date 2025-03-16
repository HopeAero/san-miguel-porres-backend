import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class Asignatura {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column() // Name of the subject
  Nombre: string;

  @Column() // Grade level associated with the subject
  grado: string;

  @DeleteDateColumn() // Column for soft-delete (stores the deletion timestamp)
  deletedAt: Date;
}