import { Representante } from '@/representante/entities/representante.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
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

  @OneToOne(() => Representante, (representante) => representante.persona, {
    cascade: true,
    nullable: true,
  })
  representante: Representante;

  @OneToOne(() => Representante, (representante) => representante.persona, {
    cascade: true,
    nullable: true,
  })
  estudiante: Representante;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
