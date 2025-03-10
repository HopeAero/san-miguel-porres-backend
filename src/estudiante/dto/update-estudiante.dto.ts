import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudianteDto } from './create-estudiante.dto';

// Extends CreateEstudianteDto but makes all fields optional
export class UpdateEstudianteDto extends PartialType(CreateEstudianteDto) {}