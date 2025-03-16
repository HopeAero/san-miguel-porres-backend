import { Representante } from '@/representante/entities/representante.entity';

export class EstudiantePersonaDto {
  id: number;
  nombre: string;
  apellido: string;
  cedula?: string;
  telefono?: string;
  direccion: string;
  fechaNacimiento: Date;
  representante: Representante;
}
