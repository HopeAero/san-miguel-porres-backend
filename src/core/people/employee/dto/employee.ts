import { PersonDto } from '@/core/people/people/dto/person.dto';
import { UserDTO } from '@/core/users/dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TypeEmployee } from '../entities/employee.entity';

export class EmployeeDto extends PersonDto {
  @ApiProperty()
  employeeType: TypeEmployee;

  @ApiProperty({ required: true })
  personId: number;

  @ApiProperty({ 
    required: false,
    description: 'ID del usuario asignado al empleado',
    example: 1 
  })
  userId?: number;

  @ApiProperty({ 
    type: () => UserDTO,
    required: false,
    description: 'Información del usuario asignado' 
  })
  assignedUser?: UserDTO;
}
