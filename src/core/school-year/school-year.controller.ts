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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Crear un nuevo año escolar' })
  create(@Body() createCrudSchoolYearDto: CreateCrudSchoolYearDto) {
    return this.schoolYearService.create(createCrudSchoolYearDto);
  }

  @Get('paginate')
  @ApiOperation({ summary: 'Obtener años escolares paginados' })
  paginate(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SchoolYear>> {
    return this.schoolYearService.paginate(pageOptionsDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Obtener años escolares para componentes de selección',
    description:
      'Devuelve una lista simplificada de años escolares con solo id y código para usar en selectores',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'Término de búsqueda para filtrar por código de año escolar',
  })
  findAllForSelect(@Query('searchTerm') searchTerm?: string) {
    return this.schoolYearService.findAll(searchTerm);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un año escolar por ID' })
  update(
    @Param('id') id: number,
    @Body() updateSchoolYearDto: UpdateSchoolYearDto,
  ) {
    return this.schoolYearService.update(id, updateSchoolYearDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un año escolar por ID' })
  findOne(@Param('id') id: number) {
    return this.schoolYearService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un año escolar por ID' })
  remove(@Param('id') id: number) {
    return this.schoolYearService.remove(id);
  }
}
