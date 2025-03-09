import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateEmpleadoDto {
  @IsNotEmpty() // Validation: CI cannot be empty
  @IsString() // Validation: CI must be a string
  CI: string;

  @IsNotEmpty() // Validation: Nombre cannot be empty
  @IsString() // Validation: Nombre must be a string
  Nombre: string;

  @IsNotEmpty() // Validation: Apellido cannot be empty
  @IsString() // Validation: Apellido must be a string
  Apellido: string;

  @IsNotEmpty() // Validation: tipo cannot be empty
  @IsEnum(['Profesor', 'Obrero']) // Validation: tipo must be either 'Profesor' or 'Obrero'
  tipo: 'Profesor' | 'Obrero';
}