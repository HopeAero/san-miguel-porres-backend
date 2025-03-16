import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateEstudianteDto {
  @IsNotEmpty() // Validation: personaId cannot be empty
  @IsNumber() // Validation: personaId must be a number
  personaId: number;

  @IsNotEmpty() // Validation: representanteId cannot be empty
  @IsNumber() // Validation: representanteId must be a number
  representanteId: number;
}
