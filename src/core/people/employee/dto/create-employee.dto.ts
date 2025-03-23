import { CreatePersonDto } from '@/core/people/people/dto/create-person.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TypeEmployee } from '../entities/employee.entity';

export class CreateEmployeeDTO extends CreatePersonDto {
  @ApiProperty()
  @IsEnum(TypeEmployee)
  @IsNotEmpty()
  employeeType: TypeEmployee;
}
