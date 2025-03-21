import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationEmployeeDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  search: string;

  @IsOptional()
  filter: Record<string, any>;
}
