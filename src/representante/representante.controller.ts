import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { RepresentanteService } from './representante.service';
//import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { PaginationRepresentanteDto } from './dto/pagination-representate.dto';
import { UpdatePersonaDto } from '@/personas/dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreatePersonaDto } from '@/personas/dto/create-persona.dto';

@ApiTags('representante')
@Controller('representante')
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Post() // POST /representante
  async create(@Body() createRepresentanteDto: CreatePersonaDto) {
    return await this.representanteService.create(createRepresentanteDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdatePersonaDto,
  ) {
    return await this.representanteService.update(id, updateRepresentanteDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.representanteService.findOne(id);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationRepresentanteDto) {
    return await this.representanteService.findAll(paginationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.representanteService.remove(id);
  }
}
