import { Estudiante } from '@/core/estudiante/entities/estudiante.entity';

export class RepresentantePersonaDto {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date;
  alumnos: Estudiante[];
}

export interface RepresentantePersona {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date;
  alumnos: Estudiante[];
}
