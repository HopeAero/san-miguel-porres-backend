import { CreatePersonDto } from '@/core/people/people/dto/create-person.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStudentDto extends CreatePersonDto {
  @ApiProperty({
    description: 'ID del representante del estudiante',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El representante es obligatorio' })
  representativeId: number;
}
