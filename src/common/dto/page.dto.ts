import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PageDto<T> {
  @ApiProperty()
  @IsArray()
  readonly items: T[];

  @ApiProperty()
  readonly paginate: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };

  constructor(items: T[], itemCount, pageOptionsDto) {
    this.items = items;
    this.paginate = {
      page: pageOptionsDto.page,
      perPage: pageOptionsDto.perPage,
      totalItems: itemCount,
      totalPages: Math.ceil(itemCount / pageOptionsDto.perPage),
      hasPreviousPage: pageOptionsDto.page > 1,
      hasNextPage:
        pageOptionsDto.page < Math.ceil(itemCount / pageOptionsDto.perPage),
    };
  }
}
