import { IsOptional, IsNumber, Min } from 'class-validator';

export class PaginationEmpleadoDto {
  @IsOptional() // Optional field
  @IsNumber() // Validation: Must be a number
  @Min(1) // Validation: Minimum value is 1
  page: number = 1; // Default value is 1

  @IsOptional() // Optional field
  @IsNumber() // Validation: Must be a number
  @Min(1) // Validation: Minimum value is 1
  limit: number = 10; // Default value is 10

  @IsOptional() // Optional field
  search: string; // Search term for filtering

  @IsOptional() // Optional field
  filter: Record<string, any>; // Additional filters as key-value pairs
}