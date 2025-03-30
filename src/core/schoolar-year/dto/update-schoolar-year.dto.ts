import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolarYearDto } from './create-schoolar-year.dto';

export class UpdateSchoolarYearDto extends PartialType(CreateSchoolarYearDto) {}
