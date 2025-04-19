import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { CourseDto } from './dto/course.dto';
import { plainToClass } from 'class-transformer';
import { PageDto } from '@/common/dto/page.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDto> {
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);
    return plainToClass(CourseDto, savedCourse);
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDto> {
    const course = await this.courseRepository.preload({
      id,
      ...updateCourseDto,
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    const updatedCourse = await this.courseRepository.save(course);
    return plainToClass(CourseDto, updatedCourse);
  }

  async findOne(id: number): Promise<CourseDto> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return plainToClass(CourseDto, course);
  }

  async paginate(paginationDto: PageOptionsDto): Promise<PageDto<CourseDto>> {
    const [result, total] = await this.courseRepository.findAndCount({
      order: {
        id: paginationDto.order,
      },
      take: paginationDto.perPage,
      skip: paginationDto.skip,
    });

    const courses: CourseDto[] = result.map((entity: Course) => {
      return plainToClass(CourseDto, {
        ...entity,
        id: entity.id,
      });
    });

    return new PageDto(courses, total, paginationDto);
  }

  async remove(id: number): Promise<void> {
    const result = await this.courseRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
