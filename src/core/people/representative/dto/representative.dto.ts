import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { PersonDto } from '../../people/dto/person.dto';
import { Student } from '../../student/entities/student.entity';
import { Type } from 'class-transformer';

export class RepresentativeDto extends PersonDto {
  @ApiProperty({ type: [Student], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Student)
  students: Student[];

  @ApiProperty({ required: true })
  personId: number;
}
