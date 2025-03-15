import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Persona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  ci: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({
    nullable: true,
  })
  telefono: string;

  @Column()
  direccion: string;

  @Column({
    type: 'date',
  })
  fechaNacimiento: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
