import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Nombre público para mostrar (opcional)',
  })
  publicName?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty()
  grade: number;
}
