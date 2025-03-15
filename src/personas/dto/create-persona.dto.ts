import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @IsOptional()
  ci: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  @IsOptional()
  telefono: string;

  @IsString()
  direccion: string;

  @IsDateString()
  fechaNacimiento: Date;
}
