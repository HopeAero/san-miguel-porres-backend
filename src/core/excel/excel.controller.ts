import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { ExcelService } from './excel.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Excel')
@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('templates')
  async getTemplates() {
    return await this.excelService.getTemplatesList();
  }

  @Post('generate/:templateName')
  async generateExcel(
    @Param('templateName') templateName: string,
    @Body() data: any[],
    @Res({ passthrough: true }) res: Response,
  ) {
    const outputFileName = `generated_${Date.now()}.xlsx`;
    const filePath = await this.excelService.generateFromTemplate(
      templateName,
      data,
      outputFileName,
    );

    const file = createReadStream(filePath);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${outputFileName}"`,
    });

    return new StreamableFile(file);
  }

  @Delete('templates/:fileName')
  async deleteTemplate(@Param('fileName') fileName: string) {
    return await this.excelService.deleteTemplate(fileName);
  }

  @Delete('generated')
  async cleanGenerated() {
    return await this.excelService.cleanGeneratedFiles();
  }
}
