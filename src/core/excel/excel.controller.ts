import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  StreamableFile,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { ExcelService } from './excel.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Excel')
@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Obtener lista de templates disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de templates obtenida exitosamente',
  })
  async getTemplates() {
    return await this.excelService.getTemplatesList();
  }

  @Get('generated')
  @ApiOperation({ summary: 'Obtener lista de archivos generados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos generados obtenida exitosamente',
  })
  async getGeneratedFiles() {
    return await this.excelService.getGeneratedFilesList();
  }

  @Post('reports/teachers')
  @ApiOperation({ summary: 'Generar reporte de registro de docentes' })
  @ApiResponse({ status: 201, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al generar el reporte' })
  async generateTeachersReport() {
    try {
      const result = await this.excelService.generateTeachersReport();
      return {
        message: 'Reporte de docentes generado exitosamente',
        fileName: result.fileName,
        downloadUrl: `/excel/download/${result.fileName}`,
      };
    } catch (error) {
      throw new HttpException(
        `Error al generar reporte de docentes: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reports/workers')
  @ApiOperation({
    summary: 'Generar reporte de registro de obreros y administrativos',
  })
  @ApiResponse({ status: 201, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al generar el reporte' })
  async generateWorkersReport() {
    return await this.excelService.generateWorkersReport();
  }

  @Post('reports/teachers/payroll')
  @ApiOperation({
    summary: 'Generar reporte de nomina de pago personal directivo docente',
  })
  @ApiResponse({ status: 201, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al generar el reporte' })
  async generateTeachersPayroll() {
    return await this.excelService.generateTeachersPayroll();
  }

  @Post('reports/workers/payroll')
  @ApiOperation({
    summary:
      'Generar reporte de nomina de pago personal obrero y administrativo',
  })
  @ApiResponse({ status: 201, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al generar el reporte' })
  async generateWorkersPayroll() {
    return await this.excelService.generateWorkersPayroll();
  }

  @Get('download/:fileName')
  @ApiOperation({ summary: 'Descargar archivo Excel generado' })
  @ApiResponse({ status: 200, description: 'Archivo descargado exitosamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const filePath = await this.excelService.getGeneratedFilePath(fileName);
      const file = createReadStream(filePath);

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      return new StreamableFile(file);
    } catch {
      throw new HttpException(
        `Archivo no encontrado: ${fileName}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete('templates/:fileName')
  @ApiOperation({ summary: 'Eliminar template' })
  @ApiResponse({ status: 200, description: 'Template eliminado exitosamente' })
  async deleteTemplate(@Param('fileName') fileName: string) {
    return await this.excelService.deleteTemplate(fileName);
  }

  @Delete('generated')
  @ApiOperation({ summary: 'Limpiar archivos generados' })
  @ApiResponse({ status: 200, description: 'Archivos limpiados exitosamente' })
  async cleanGenerated() {
    return await this.excelService.cleanGeneratedFiles();
  }
}
