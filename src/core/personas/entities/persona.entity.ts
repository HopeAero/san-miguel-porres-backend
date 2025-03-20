import { Estudiante } from '@/core/estudiante/entities/estudiante.entity';
import { Representante } from '@/core/representante/entities/representante.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
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

  @OneToOne(() => Representante, (representante) => representante.persona, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  representante: Relation<Representante>;

  @OneToOne(() => Estudiante, (estudiante) => estudiante.persona, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  estudiante: Relation<Estudiante>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
