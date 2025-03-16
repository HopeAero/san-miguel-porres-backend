import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignaturaDto } from './create-asignatura.dto';

// Extends CreateAsignaturaDto but makes all fields optional
export class UpdateAsignaturaDto extends PartialType(CreateAsignaturaDto) {}