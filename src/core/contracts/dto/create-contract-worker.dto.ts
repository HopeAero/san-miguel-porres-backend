import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateContractWorkerDto {
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
  qualification: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  grade: string;

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
  yearsOfServiceAvec: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  yearsOfServiceExternal: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  yearsOfServiceOtherAvec: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDecimal()
  @Transform(({ value }) => value.toString())
  monthlySalary: string;

  @ApiProperty()
  @IsOptional()
  @IsDecimal()
  @Transform(({ value }) => value.toString())
  nightBonus: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  transport: boolean;

  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  antique: string;

  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  bonusAcademic: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  nroOfChildren: number;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  bonusCompensatory: string;

  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  bonusForChildren: string;

  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  geography: string;

  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  homeCareAssistance: string;

  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  bonusDisability: string;

  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  totalSalary: string;
}
