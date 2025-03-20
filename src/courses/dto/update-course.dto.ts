import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';

// Extends CreateCourseDto but makes all fields optional
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
