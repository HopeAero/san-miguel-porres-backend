import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiProperty({
    description: 'ID del representante del estudiante',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  representativeId?: number;
}
