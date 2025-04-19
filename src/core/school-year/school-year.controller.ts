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
import { SchoolYearService } from './school-year.service';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { PageOptionsDto } from '../../common/dto/page.option.dto';
import { PageDto } from '../../common/dto/page.dto';
import { SchoolYear } from './entities/school-year.entity';
import { CreateCrudSchoolYearDto } from './dto/create-crud-school-year.dto';

@ApiTags('SchoolYear')
@ApiBearerAuth()
@Controller('school-years')
export class SchoolYearController {
  constructor(private readonly schoolYearService: SchoolYearService) {}

  @Post()
  create(@Body() createCrudSchoolYearDto: CreateCrudSchoolYearDto) {
    return this.schoolYearService.create(createCrudSchoolYearDto);
  }

  @Get('paginate')
  paginate(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SchoolYear>> {
    return this.schoolYearService.paginate(pageOptionsDto);
  }

  @Get('all')
  findAll() {
    return this.schoolYearService.findAll();
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateSchoolYearDto: UpdateSchoolYearDto,
  ) {
    return this.schoolYearService.update(id, updateSchoolYearDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.schoolYearService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.schoolYearService.remove(id);
  }
}
