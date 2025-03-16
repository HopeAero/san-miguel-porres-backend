import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { RepresentanteService } from './representante.service';
//import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { PaginationRepresentanteDto } from './dto/pagination-representate.dto';
import { UpdatePersonaDto } from '@/personas/dto/update-persona.dto';

@Controller('representante')
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  // @Post() // POST /representante
  // create(@Body() createRepresentanteDto: CreateRepresentanteDto) {
  //   return this.representanteService.create(createRepresentanteDto); // Call service to create
  // }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdatePersonaDto,
  ) {
    return this.representanteService.update(id, updateRepresentanteDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.representanteService.findOne(id);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationRepresentanteDto) {
    return this.representanteService.findAll(paginationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.representanteService.remove(id);
  }
}
