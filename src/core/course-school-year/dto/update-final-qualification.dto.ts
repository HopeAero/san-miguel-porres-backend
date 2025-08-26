import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFinalQualificationDto {
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 }, 
    { message: 'La calificación debe ser un número con máximo 2 decimales' }
  )
  @Type(() => Number)
  @Min(0, { message: 'La calificación no puede ser menor a 0' })
  @Max(20, { message: 'La calificación no puede ser mayor a 20' })
  finalQualification?: number | null;
}
