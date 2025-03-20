import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePersonDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  dni: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  direction: string;

  @ApiProperty()
  @IsDateString()
  birthDate: Date;
}
