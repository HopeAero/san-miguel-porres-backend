import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { SchoolarYearService } from './schoolar-year.service';
import { CreateSchoolarYearDto } from './dto/create-schoolar-year.dto';
import { UpdateSchoolarYearDto } from './dto/update-schoolar-year.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { SchoolarYear } from './entities/schoolar-year.entity';

@Controller('schoolar-years')
export class SchoolarYearController {
  constructor(private readonly schoolarYearService: SchoolarYearService) {}

  @Post()
  create(@Body() createSchoolarYearDto: CreateSchoolarYearDto) {
    return this.schoolarYearService.create(createSchoolarYearDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateSchoolarYearDto: UpdateSchoolarYearDto,
  ) {
    return this.schoolarYearService.update(id, updateSchoolarYearDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.schoolarYearService.findOne(id);
  }

  @Get()
  paginate(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SchoolarYear>> {
    return this.schoolarYearService.paginate(pageOptionsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.schoolarYearService.remove(id);
  }
}
