import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO para representar un corte escolar después de procesado en el backend
 * Incluye courtNumber asignado por el backend en orden secuencial
 */
export class ProcessedSchoolCourtDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  courtNumber: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}
