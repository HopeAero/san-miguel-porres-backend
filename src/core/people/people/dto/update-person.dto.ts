import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonaDto } from './create-person.dto';

export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {}
