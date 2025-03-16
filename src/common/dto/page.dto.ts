import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PageDto<T> {
  @ApiProperty()
  @IsArray()
  readonly items: T[];

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly perPage: number;

  @ApiProperty()
  readonly totalItems: number;

  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(items: T[], itemCount, pageOptionsDto) {
    this.items = items;
    this.page = pageOptionsDto.page;
    this.perPage = pageOptionsDto.perPage;
    this.totalItems = itemCount;
    this.totalPages = Math.ceil(this.totalItems / this.perPage);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.totalPages;
  }
}
