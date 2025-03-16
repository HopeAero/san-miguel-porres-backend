import { Estudiante } from '@/estudiante/entities/estudiante.entity';

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
