import { Student } from '@/peopleModule/student/entities/student.entity';

export class RepresentantePersonaDto {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date;
  alumnos: Student[];
}

export interface RepresentantePersona {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date;
  alumnos: Student[];
}
