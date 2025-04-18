import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { CourseDto } from './dto/course';
import { plainToClass } from 'class-transformer';
import { PageDto } from '@/common/dto/page.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(course);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.courseRepository.preload({
      id,
      ...updateCourseDto,
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return this.courseRepository.save(course);
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async paginate(paginationDto: PageOptionsDto): Promise<PageDto<Course>> {
    const [result, total] = await this.courseRepository.findAndCount({
      order: {
        id: paginationDto.order,
      },
      take: paginationDto.perPage,
      skip: paginationDto.skip,
      relations: {},
    });

    const courses: CourseDto[] = result.map((entity: Course) => {
      const item: CourseDto = plainToClass(CourseDto, {
        ...entity,
        id: entity.id,
      });

      return item;
    });

    return new PageDto(courses, total, paginationDto);
  }

  async remove(id: number): Promise<void> {
    const result = await this.courseRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Asignatura with ID ${id} not found`);
    }
  }
}
