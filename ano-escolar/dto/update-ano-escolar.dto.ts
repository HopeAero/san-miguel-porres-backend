import { PartialType } from '@nestjs/mapped-types';
import { CreateAnoEscolarDto } from './create-ano-escolar.dto';

// Extends CreateAnoEscolarDto but makes all fields optional
export class UpdateAnoEscolarDto extends PartialType(CreateAnoEscolarDto) {}