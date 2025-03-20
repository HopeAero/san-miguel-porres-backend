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
import { PaginationCourseDto } from './dto/pagination-course.dto';

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
  findAll(@Query() paginationDto: PaginationCourseDto) {
    return this.coursesService.findAll(paginationDto);
  }

  @Delete(':id') // DELETE /courses/:id
  remove(@Param('id') id: number) {
    return this.coursesService.remove(id);
  }
}
