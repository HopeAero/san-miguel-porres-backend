import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProcessedSchoolCourtDto } from './processed-school-court.dto';

/**
 * DTO para representar un lapso escolar después de procesado en el backend
 * Incluye lapseNumber asignado por el backend en orden secuencial
 */
export class ProcessedSchoolLapseDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  lapseNumber: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsArray()
  @Type(() => ProcessedSchoolCourtDto)
  schoolCourts: ProcessedSchoolCourtDto[] = [];
}
