import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoDto } from './create-empleado.dto';

// Extends CreateEmpleadoDto but makes all fields optional
export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {}