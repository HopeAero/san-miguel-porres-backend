import { PartialType } from '@nestjs/mapped-types';
import { CreateRepresentanteDto } from './create-representante.dto';

// Extends CreateRepresentanteDto but makes all fields optional
export class UpdateRepresentanteDto extends PartialType(CreateRepresentanteDto) {}