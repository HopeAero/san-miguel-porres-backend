import { Representante } from '@/peopleModule/representante/entities/representante.entity';

export class StudentPersonDto {
  id: number;
  nombre: string;
  apellido: string;
  cedula?: string;
  telefono?: string;
  direccion: string;
  fechaNacimiento: Date;
  representante: Representante;
}
