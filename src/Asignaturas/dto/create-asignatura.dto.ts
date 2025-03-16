import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAsignaturaDto {
  @IsNotEmpty() // Validation: Nombre cannot be empty
  @IsString() // Validation: Nombre must be a string
  Nombre: string;

  @IsNotEmpty() // Validation: grado cannot be empty
  @IsString() // Validation: grado must be a string
  grado: string;
}