import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateContractDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dni: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  level: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDecimal()
  @Transform(({ value }) => value.toString())
  workingHours: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDecimal()
  @Transform(({ value }) => value.toString())
  hoursWorked: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDecimal()
  @Transform(({ value }) => value.toString())
  hourlyCost: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  yearsOfService: number;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  monthlySalary: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  hierarchy: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  transport: boolean;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  antique: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  teachingExercise: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  nroOfChildren: number;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  postgraduate: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  bonusForChildren: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  geography: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  homeCareAssistance: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  bonusDisability: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  totalSalary: string;
}
