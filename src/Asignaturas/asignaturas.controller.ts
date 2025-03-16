import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';
import { PaginationAsignaturaDto } from './dto/pagination-asignatura.dto';

@Controller('asignaturas') // Base route for all endpoints
export class AsignaturasController {
  constructor(private readonly asignaturasService: AsignaturasService) {}

  @Post() // POST /asignaturas
  create(@Body() createAsignaturaDto: CreateAsignaturaDto) {
    return this.asignaturasService.create(createAsignaturaDto); // Call service to create
  }

  @Put(':id') // PUT /asignaturas/:id
  update(@Param('id') id: number, @Body() updateAsignaturaDto: UpdateAsignaturaDto) {
    return this.asignaturasService.update(id, updateAsignaturaDto); // Call service to update
  }

  @Get(':id') // GET /asignaturas/:id
  findOne(@Param('id') id: number) {
    return this.asignaturasService.findOne(id); // Call service to find one
  }

  @Get() // GET /asignaturas
  findAll(@Query() paginationDto: PaginationAsignaturaDto) {
    return this.asignaturasService.findAll(paginationDto); // Call service to find all with pagination
  }

  @Delete(':id') // DELETE /asignaturas/:id
  remove(@Param('id') id: number) {
    return this.asignaturasService.remove(id); // Call service to soft-delete
  }
}