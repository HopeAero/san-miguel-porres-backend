import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO para recibir datos de cortes escolares desde el frontend durante actualización
 * No incluye courtNumber, que será asignado por el backend en orden secuencial
 */
export class UpdateInputSchoolCourtDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}
