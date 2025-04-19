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
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { Role } from '@/common/enum/role';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { CourseDto } from './dto/course.dto';
import { PageDto } from '@/common/dto/page.dto';

@ApiTags('Courses')
@Roles(Role.MODERATOR, Role.ADMIN)
@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post() // POST /courses
  create(@Body() createCourseDto: CreateCourseDto): Promise<CourseDto> {
    return this.coursesService.create(createCourseDto);
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

  @Get() // GET /courses
  paginate(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<CourseDto>> {
    return this.coursesService.paginate(paginationDto);
  }

  @Delete(':id') // DELETE /courses/:id
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coursesService.remove(id);
  }
}
