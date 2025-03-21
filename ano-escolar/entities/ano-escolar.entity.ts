import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class AnoEscolar {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column({ unique: true }) // Unique code for the school year (e.g., "2023-2024")
  codigo: string;

  @Column() // Start date of the school year
  fechaInicio: Date;

  @Column() // End date of the school year
  fechaFin: Date;

  @DeleteDateColumn() // Column for soft-delete (stores the deletion timestamp)
  deletedAt: Date;
}