import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Order } from '@/common/constants/order.constant';

export class PageOptionsDto {
  /**
   * Pagination - Current Page Number
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  /**
   * Pagination - Items Per Page
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly perPage?: number = 10;

  /**
   * Sorting Order
   */
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  /**
   * Get number of items to skip
   */
  get skip(): number {
    return (this.page - 1) * this.perPage;
  }

  /**
   * Search term for filtering results
   */
  @IsString()
  @IsOptional()
  readonly searchTerm?: string;

  /**
   * Employee type for filtering employee results
   */
  @IsString()
  @IsOptional()
  readonly employeeType?: string;

  /**
   * Grade for filtering course results
   */
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly grade?: number;
}
