import { CreatePersonDto } from '@/core/people/people/dto/create-person.dto';
import { TypeEmployee } from '@/common/enum/employee-type.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDTO extends CreatePersonDto {
  @ApiProperty({ description: 'Tipo de empleado' })
  @IsEnum(TypeEmployee)
  employeeType: TypeEmployee;
}
