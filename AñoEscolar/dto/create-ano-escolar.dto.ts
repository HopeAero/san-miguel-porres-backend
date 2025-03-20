import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateAnoEscolarDto {
  @IsNotEmpty() // Validation: codigo cannot be empty
  @IsString() // Validation: codigo must be a string
  codigo: string;

  @IsNotEmpty() // Validation: fechaInicio cannot be empty
  @IsDateString() // Validation: fechaInicio must be a valid date string
  fechaInicio: Date;

  @IsNotEmpty() // Validation: fechaFin cannot be empty
  @IsDateString() // Validation: fechaFin must be a valid date string
  fechaFin: Date;
}