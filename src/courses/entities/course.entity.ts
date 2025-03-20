import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column() // Name of the subject
  name: string;

  @Column() // Grade level associated with the subject
  grade: string;

  @DeleteDateColumn() // Column for soft-delete (stores the deletion timestamp)
  deletedAt: Date;
}
