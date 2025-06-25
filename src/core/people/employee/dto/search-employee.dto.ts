import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TypeEmployee } from '@/common/enum/employee-type.enum';
import { Transform } from 'class-transformer';

export class SearchEmployeeDto {
  @ApiProperty({
    description: 'Texto para buscar por nombre (autocomplete)',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de empleado',
    required: false,
    enum: TypeEmployee,
  })
  @IsOptional()
  @IsEnum(TypeEmployee)
  employeeType?: TypeEmployee;

  @ApiProperty({
    description: 'Limitar la cantidad de resultados',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiProperty({
    description:
      'IDs de empleados que deben incluirse siempre, separados por coma',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  forceItemsIds?: string;
}
