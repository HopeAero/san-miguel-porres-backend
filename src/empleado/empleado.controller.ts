import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { PaginationEmpleadoDto } from './dto/pagination-empleado.dto';

@Controller('empleado') // Base route for all endpoints
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Post() // POST /empleado
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadoService.create(createEmpleadoDto); // Call service to create
  }

  @Put(':id') // PUT /empleado/:id
  update(@Param('id') id: number, @Body() updateEmpleadoDto: UpdateEmpleadoDto) {
    return this.empleadoService.update(id, updateEmpleadoDto); // Call service to update
  }

  @Get(':id') // GET /empleado/:id
  findOne(@Param('id') id: number) {
    return this.empleadoService.findOne(id); // Call service to find one
  }

  @Get() // GET /empleado
  findAll(@Query() paginationDto: PaginationEmpleadoDto) {
    return this.empleadoService.findAll(paginationDto); // Call service to find all with pagination
  }

  @Delete(':id') // DELETE /empleado/:id
  remove(@Param('id') id: number) {
    return this.empleadoService.remove(id); // Call service to soft-delete
  }
}