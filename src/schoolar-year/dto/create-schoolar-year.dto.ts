import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateSchoolarYearDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}