import { Representante } from '@/peopleModule/representante/entities/representante.entity';
import { Student } from '@/peopleModule/student/entities/student.entity';
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

  @OneToOne(() => Student, (student) => student.persona, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  student: Relation<Student>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
