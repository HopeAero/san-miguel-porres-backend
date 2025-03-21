import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { AnoEscolarService } from './ano-escolar.service';
import { CreateAnoEscolarDto } from './dto/create-ano-escolar.dto';
import { UpdateAnoEscolarDto } from './dto/update-ano-escolar.dto';
import { PaginationAnoEscolarDto } from './dto/pagination-ano-escolar.dto';

@Controller('ano-escolar') // Base route for all endpoints
export class AnoEscolarController {
  constructor(private readonly anoEscolarService: AnoEscolarService) {}

  @Post() // POST /ano-escolar
  create(@Body() createAnoEscolarDto: CreateAnoEscolarDto) {
    return this.anoEscolarService.create(createAnoEscolarDto); // Call service to create
  }

  @Put(':id') // PUT /ano-escolar/:id
  update(@Param('id') id: number, @Body() updateAnoEscolarDto: UpdateAnoEscolarDto) {
    return this.anoEscolarService.update(id, updateAnoEscolarDto); // Call service to update
  }

  @Get(':id') // GET /ano-escolar/:id
  findOne(@Param('id') id: number) {
    return this.anoEscolarService.findOne(id); // Call service to find one
  }

  @Get() // GET /ano-escolar
  findAll(@Query() paginationDto: PaginationAnoEscolarDto) {
    return this.anoEscolarService.findAll(paginationDto); // Call service to find all with pagination
  }

  @Delete(':id') // DELETE /ano-escolar/:id
  remove(@Param('id') id: number) {
    return this.anoEscolarService.remove(id); // Call service to soft-delete
  }
}