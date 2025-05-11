import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseSchoolYearService } from './course-school-year.service';
import { CreateCourseSchoolYearDto } from './dto/create-course-school-year.dto';
import { UpdateCourseSchoolYearDto } from './dto/update-course-school-year.dto';
import { CourseSchoolYearResponseDto } from './dto/course-school-year-response.dto';
import { PaginateCourseSchoolYearDto } from './dto/paginate-course-school-year.dto';
import { PageDto } from '@/common/dto/page.dto';

@ApiTags('course-school-year')
@Controller('course-school-year')
export class CourseSchoolYearController {
  constructor(
    private readonly courseSchoolYearService: CourseSchoolYearService,
  ) {}

  @ApiOperation({
    summary: 'Obtener todos los course-school-years sin paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado completo de asignaturas por año escolar',
    type: [CourseSchoolYearResponseDto],
  })
  @ApiQuery({
    name: 'schoolYearId',
    required: false,
    description: 'ID del año escolar',
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    description: 'Grado (nivel educativo)',
  })
  @Get('all')
  async findAllWithoutPagination(
    @Query('schoolYearId', new ParseIntPipe({ optional: true }))
    schoolYearId?: number,
    @Query('grade') grade?: string,
  ) {
    return this.courseSchoolYearService.findAllWithoutPagination(
      schoolYearId,
      grade,
    );
  }

  @ApiOperation({
    summary: 'Obtener listado paginado de asignaturas por año escolar',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de asignaturas por año escolar',
    type: PageDto,
  })
  @Get()
  async findAll(@Query() options: PaginateCourseSchoolYearDto) {
    return this.courseSchoolYearService.paginate(options);
  }

  @ApiOperation({ summary: 'Obtener asignatura por año escolar por ID' })
  @ApiResponse({
    status: 200,
    description: 'Datos de la asignatura por año escolar',
    type: CourseSchoolYearResponseDto,
  })
  @ApiParam({ name: 'id', description: 'ID de la asignatura por año escolar' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseSchoolYearService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear nueva asignatura por año escolar' })
  @ApiResponse({
    status: 201,
    description: 'Asignatura por año escolar creada exitosamente',
    type: CourseSchoolYearResponseDto,
  })
  @Post()
  async create(@Body() createDto: CreateCourseSchoolYearDto) {
    return this.courseSchoolYearService.create(createDto);
  }

  @ApiOperation({ summary: 'Actualizar asignatura por año escolar' })
  @ApiResponse({
    status: 200,
    description: 'Asignatura por año escolar actualizada exitosamente',
    type: CourseSchoolYearResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignatura por año escolar a actualizar',
  })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCourseSchoolYearDto,
  ) {
    return this.courseSchoolYearService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Eliminar asignatura por año escolar' })
  @ApiResponse({
    status: 200,
    description: 'Asignatura por año escolar eliminada exitosamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignatura por año escolar a eliminar',
  })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseSchoolYearService.remove(id);
  }
}
