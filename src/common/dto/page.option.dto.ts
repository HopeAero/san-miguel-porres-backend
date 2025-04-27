import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
export class PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly perPage?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda para filtrar registros (opcional)',
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly searchTerm?: string | null;

  @Expose()
  get skip(): number {
    return (this.page - 1) * this.perPage;
  }

  set skip(value: number) {}
}
