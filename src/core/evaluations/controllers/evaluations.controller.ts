import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EvaluationsService } from '../services/evaluations.service';
import { EvaluationDto, EvaluationResponseDto } from '../dto/evaluation.dto';

@ApiTags('evaluations')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @ApiOperation({ summary: 'Listar todas las evaluaciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de evaluaciones paginada',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'courseSchoolYearId', required: false, type: Number })
  @ApiQuery({ name: 'schoolCourtId', required: false, type: Number })
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('courseSchoolYearId') courseSchoolYearId?: number,
    @Query('schoolCourtId') schoolCourtId?: number,
  ) {
    return this.evaluationsService.findAll(
      page,
      perPage,
      searchTerm,
      courseSchoolYearId,
      schoolCourtId,
    );
  }

  @ApiOperation({ summary: 'Obtener una evaluación por ID' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación encontrada',
    type: EvaluationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.evaluationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Obtener evaluaciones por curso-año escolar' })
  @ApiResponse({
    status: 200,
    description: 'Lista de evaluaciones por curso-año escolar',
  })
  @ApiResponse({ status: 404, description: 'Curso-año escolar no encontrado' })
  @Get('by-course-school-year/:courseSchoolYearId')
  async findByCourseSchoolYear(
    @Param('courseSchoolYearId', ParseIntPipe) courseSchoolYearId: number,
  ) {
    return this.evaluationsService.findByCourseSchoolYear(courseSchoolYearId);
  }

  @ApiOperation({ summary: 'Crear una nueva evaluación' })
  @ApiResponse({
    status: 201,
    description: 'Evaluación creada exitosamente',
    type: EvaluationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Post()
  async create(@Body() evaluationDto: EvaluationDto) {
    return this.evaluationsService.create(evaluationDto);
  }

  @ApiOperation({ summary: 'Actualizar una evaluación existente' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación actualizada exitosamente',
    type: EvaluationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() evaluationDto: EvaluationDto,
  ) {
    return this.evaluationsService.update(id, evaluationDto);
  }

  @ApiOperation({ summary: 'Eliminar una evaluación' })
  @ApiResponse({
    status: 204,
    description: 'Evaluación eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.evaluationsService.remove(id);
  }
} 