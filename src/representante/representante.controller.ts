import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { RepresentanteService } from './representante.service';
import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { PaginationRepresentanteDto } from './dto/pagination-representante.dto';

@Controller('representante') // Base route for all endpoints
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Post() // POST /representante
  create(@Body() createRepresentanteDto: CreateRepresentanteDto) {
    return this.representanteService.create(createRepresentanteDto); // Call service to create
  }

  @Put(':id') // PUT /representante/:id
  update(@Param('id') id: number, @Body() updateRepresentanteDto: UpdateRepresentanteDto) {
    return this.representanteService.update(id, updateRepresentanteDto); // Call service to update
  }

  @Get(':id') // GET /representante/:id
  findOne(@Param('id') id: number) {
    return this.representanteService.findOne(id); // Call service to find one
  }

  @Get() // GET /representante
  findAll(@Query() paginationDto: PaginationRepresentanteDto) {
    return this.representanteService.findAll(paginationDto); // Call service to find all with pagination
  }

  @Delete(':id') // DELETE /representante/:id
  remove(@Param('id') id: number) {
    return this.representanteService.remove(id); // Call service to soft-delete
  }
}