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
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { EvaluationsService } from '../services/evaluations.service';
import { EvaluationDto, EvaluationResponseDto } from '../dto/evaluation.dto';
import { EvaluationWithStudentsResponseDto } from '../dto/student-evaluation-qualification.dto';
import {
  BulkUpdateQualificationsDto,
  UpdateQualificationDto,
} from '../dto/update-qualification.dto';

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

  @ApiOperation({
    summary:
      'Obtener estudiantes y sus calificaciones para una evaluación específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la evaluación y calificaciones de estudiantes',
    type: EvaluationWithStudentsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @Get(':id/students')
  async findStudentsByEvaluation(@Param('id', ParseIntPipe) id: number) {
    return this.evaluationsService.findStudentsByEvaluation(id);
  }

  @ApiOperation({
    summary: 'Actualizar la calificación de un estudiante en una evaluación',
  })
  @ApiResponse({
    status: 200,
    description: 'Calificación actualizada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @Put(':id/student-qualification')
  async updateStudentQualification(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateQualificationDto,
  ) {
    return this.evaluationsService.updateStudentQualification(id, updateDto);
  }

  @ApiOperation({
    summary:
      'Actualizar calificaciones de múltiples estudiantes en una evaluación',
  })
  @ApiResponse({
    status: 200,
    description: 'Calificaciones actualizadas correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @Put(':id/students-qualifications')
  async updateStudentsQualifications(
    @Param('id', ParseIntPipe) id: number,
    @Body() bulkUpdateDto: BulkUpdateQualificationsDto,
  ) {
    return this.evaluationsService.updateStudentsQualifications(
      id,
      bulkUpdateDto,
    );
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
