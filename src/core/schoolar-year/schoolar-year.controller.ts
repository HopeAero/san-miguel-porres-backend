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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolarYearService } from './schoolar-year.service';
import { UpdateSchoolarYearDto } from './dto/update-schoolar-year.dto';
import { PageOptionsDto } from '../../common/dto/page.option.dto';
import { PageDto } from '../../common/dto/page.dto';
import { SchoolarYear } from './entities/schoolar-year.entity';
import { CreateCrudOfCrudSchoolarYearDto } from './dto/create-crud-of-crud.dto';

@ApiTags('SchoolarYear')
@ApiBearerAuth()
@Controller('schoolar-years')
export class SchoolarYearController {
  constructor(private readonly schoolarYearService: SchoolarYearService) {}

  @Post()
  create(@Body() createCrudOfCrudSchoolarDto: CreateCrudOfCrudSchoolarYearDto) {
    return this.schoolarYearService.create(createCrudOfCrudSchoolarDto);
  }

  @Get('paginate')
  paginate(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SchoolarYear>> {
    return this.schoolarYearService.paginate(pageOptionsDto);
  }

  @Get('all')
  findAll() {
    return this.schoolarYearService.findAll();
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

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.schoolarYearService.remove(id);
  }
}
