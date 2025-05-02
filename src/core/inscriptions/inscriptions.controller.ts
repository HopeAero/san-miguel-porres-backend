import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { InscriptionsService } from './inscriptions.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { PaginateInscriptionDto } from './dto/paginate-inscription.dto';

@ApiTags('Inscriptions')
@Controller('inscriptions')
export class InscriptionsController {
  constructor(private readonly inscriptionsService: InscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de inscripciones' })
  @ApiResponse({ status: 200, description: 'Lista de inscripciones obtenida correctamente' })
  findAll(@Query() paginateDto: PaginateInscriptionDto) {
    return this.inscriptionsService.findAll(paginateDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una inscripción por ID' })
  @ApiResponse({ status: 200, description: 'Inscripción obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  findOne(@Param('id') id: string) {
    return this.inscriptionsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva inscripción' })
  @ApiResponse({ status: 201, description: 'Inscripción creada correctamente' })
  create(@Body() createInscriptionDto: CreateInscriptionDto) {
    return this.inscriptionsService.create(createInscriptionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una inscripción' })
  @ApiResponse({ status: 200, description: 'Inscripción actualizada correctamente' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  update(@Param('id') id: string, @Body() updateInscriptionDto: UpdateInscriptionDto) {
    return this.inscriptionsService.update(+id, updateInscriptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una inscripción' })
  @ApiResponse({ status: 200, description: 'Inscripción eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  async remove(@Param('id') id: string) {
    await this.inscriptionsService.remove(+id);
    return { message: `Inscripción con ID ${id} eliminada correctamente` };
  }
}
