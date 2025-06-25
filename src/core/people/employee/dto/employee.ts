import { PersonDto } from '@/core/people/people/dto/person.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TypeEmployee } from '@/common/enum/employee-type.enum';

export class EmployeeDto extends PersonDto {
  @ApiProperty({
    description: 'Tipo de empleado',
  })
  employeeType: TypeEmployee;

  @ApiProperty({
    type: () => Number,
    description: 'ID de la persona asociada',
  })
  personId: number;
}
