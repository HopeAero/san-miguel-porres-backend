import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePersonaDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  ci: string;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  apellido: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  telefono: string;

  @ApiProperty()
  @IsString()
  direccion: string;

  @ApiProperty()
  @IsDateString()
  fechaNacimiento: Date;
}
