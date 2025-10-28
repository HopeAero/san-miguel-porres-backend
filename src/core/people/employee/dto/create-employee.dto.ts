import { CreatePersonDto } from '@/core/people/people/dto/create-person.dto';
import { TypeEmployee } from '../entities/employee.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateEmployeeDTO extends CreatePersonDto {
  @ApiProperty({ enum: TypeEmployee, default: TypeEmployee.Professor })
  @IsEnum(TypeEmployee)
  employeeType: TypeEmployee;

  @ApiProperty({ 
    required: false,
    description: 'ID del usuario asignado al empleado (solo para profesores)',
    example: 1
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  userId?: number;
}
