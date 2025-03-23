import { CreatePersonDto } from '@/core/people/people/dto/create-person.dto';
import { TypeEmployee } from '../entities/employee.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateEmployeeDTO extends CreatePersonDto {
  @ApiProperty({ enum: TypeEmployee, default: TypeEmployee.Professor })
  @IsEnum(TypeEmployee)
  employeeType: TypeEmployee;
}
