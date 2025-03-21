import { PersonDto } from '@/core/people/people/dto/person.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TypeEmployee } from '../entities/employee.entity';

export class EmployeeDto extends PersonDto {
  @ApiProperty()
  employeeType: TypeEmployee;
}
