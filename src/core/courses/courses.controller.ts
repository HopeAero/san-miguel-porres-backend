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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/dto/page.option.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post() // POST /courses
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Put(':id') // PUT /courses/:id
  update(@Param('id') id: number, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Get(':id') // GET /courses/:id
  findOne(@Param('id') id: number) {
    return this.coursesService.findOne(id);
  }

  @Get() // GET /courses
  paginate(@Query() paginationDto: PageOptionsDto) {
    return this.coursesService.paginate(paginationDto);
  }

  @Delete(':id') // DELETE /courses/:id
  remove(@Param('id') id: number) {
    return this.coursesService.remove(id);
  }
}
