import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateInputSchoolCourtDto } from './update-input-school-court.dto';
import { Type } from 'class-transformer';

/**
 * DTO para recibir datos de lapsos escolares desde el frontend durante actualización
 * No incluye lapseNumber, que será asignado por el backend en orden secuencial
 */
export class UpdateInputSchoolLapseDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @Type(() => UpdateInputSchoolCourtDto)
  schoolCourts: UpdateInputSchoolCourtDto[] = [];
}
