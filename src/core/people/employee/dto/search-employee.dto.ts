import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeEmployee } from '../entities/employee.entity';

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
}
