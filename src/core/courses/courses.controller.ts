import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { Role } from '@/common/enum/role';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CourseDto } from './dto/course.dto';
import { PageDto } from '@/common/dto/page.dto';
import { CourseByGradeDto } from './dto/course-by-grade.dto';

@ApiTags('Courses')
@Roles(Role.MODERATOR, Role.ADMIN)
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post() // POST /courses
  create(@Body() createCourseDto: CreateCourseDto): Promise<CourseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get('all') // GET /courses/all
  @ApiOperation({
    summary: 'Obtener todos los cursos para selectores',
    description:
      'Retorna todos los cursos activos sin paginar, opcionalmente filtrados por grado, nombre y con límite',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos',
    type: [CourseByGradeDto],
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    type: Number,
    description: 'Filtrar por grado específico (opcional)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filtrar por nombre o parte del nombre (opcional)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limitar la cantidad de resultados (opcional)',
  })
  findAll(
    @Query(
      'grade',
      new DefaultValuePipe(undefined),
      new ParseIntPipe({ optional: true }),
    )
    grade?: number,
    @Query('name') name?: string,
    @Query(
      'limit',
      new DefaultValuePipe(undefined),
      new ParseIntPipe({ optional: true }),
    )
    limit?: number,
  ): Promise<CourseByGradeDto[]> {
    return this.coursesService.findAll(grade, name, limit);
  }

  @Get('paginate') // GET /courses/paginate
  paginate(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<CourseDto>> {
    return this.coursesService.paginate(paginationDto);
  }

  @Put(':id') // PUT /courses/:id
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Get(':id') // GET /courses/:id
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CourseDto> {
    return this.coursesService.findOne(id);
  }

  @Delete(':id') // DELETE /courses/:id
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coursesService.remove(id);
  }
}
