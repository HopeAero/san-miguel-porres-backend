import { Representative } from '@/core/people/representative/entities/representative.entity';
import { PersonDto } from '@/core/people/people/dto/person.dto';
import { ApiProperty } from '@nestjs/swagger';

export class StudentDto extends PersonDto {
  @ApiProperty({ type: Representative })
  representative: Representative;
}
