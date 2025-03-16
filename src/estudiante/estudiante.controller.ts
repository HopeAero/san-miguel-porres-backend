import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { PaginationEstudianteDto } from './dto/pagination-estudiante.dto';

@Controller('estudiante') // Base route for all endpoints
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post() // POST /estudiante
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteService.create(createEstudianteDto); // Call service to create
  }

  @Put(':id') // PUT /estudiante/:id
  update(
    @Param('id') id: number,
    @Body() updateEstudianteDto: UpdateEstudianteDto,
  ) {
    return this.estudianteService.update(id, updateEstudianteDto); // Call service to update
  }

  @Get(':id') // GET /estudiante/:id
  findOne(@Param('id') id: number) {
    return this.estudianteService.findOne(id); // Call service to find one
  }

  @Get() // GET /estudiante
  findAll(@Query() paginationDto: PaginationEstudianteDto) {
    return this.estudianteService.findAll(paginationDto); // Call service to find all with pagination
  }

  @Delete(':id') // DELETE /estudiante/:id
  remove(@Param('id') id: number) {
    return this.estudianteService.remove(id); // Call service to soft-delete
  }
}
