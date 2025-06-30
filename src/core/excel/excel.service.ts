import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import envConfig from '@/config/environment';
import { Environments } from '@/config/config.enums';

@Injectable()
export class ExcelService {
  private readonly templatesPath: string;
  private readonly generatedPath = path.join(__dirname, 'generated');

  constructor() {
    // Determinar si estamos en desarrollo o producción
    const isDevelopment = envConfig.ENVIRONMENT !== Environments.PROD;

    if (isDevelopment) {
      // En desarrollo, usar la ruta del código fuente
      this.templatesPath = path.join(
        process.cwd(),
        'src',
        'core',
        'excel',
        'templates',
      );
    } else {
      // En producción, usar la ruta compilada
      this.templatesPath = path.join(__dirname, 'templates');
    }

    // Asegurar que las carpetas necesarias existan
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.templatesPath)) {
      fs.mkdirSync(this.templatesPath, { recursive: true });
    }
    if (!fs.existsSync(this.generatedPath)) {
      fs.mkdirSync(this.generatedPath, { recursive: true });
    }
  }

  async getTemplatesList(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.templatesPath);
      // Filtrar solo archivos de Excel y excluir README.md
      return files.filter(
        (file) =>
          file.endsWith('.xlsx') ||
          file.endsWith('.xls') ||
          file.endsWith('.xlsm'),
      );
    } catch (error) {
      console.error('Error leyendo directorio de plantillas:', error);
      console.log('Ruta de plantillas:', this.templatesPath);
      return [];
    }
  }

  async uploadTemplate(
    fileName: string,
    buffer: Buffer,
  ): Promise<{ message: string }> {
    const filePath = path.join(this.templatesPath, fileName);
    await fs.promises.writeFile(filePath, buffer);
    return { message: 'Plantilla subida exitosamente' };
  }

  async generateFromTemplate(
    templateName: string,
    data: any[],
    outputFileName: string,
  ): Promise<string> {
    const templatePath = path.join(this.templatesPath, templateName);

    if (!fs.existsSync(templatePath)) {
      throw new Error('La plantilla no existe');
    }

    // Cargar la plantilla
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1);

    // Aplicar los datos a la plantilla
    data.forEach((row, rowIndex) => {
      const excelRow = worksheet.getRow(rowIndex + 2); // Empezar después del encabezado
      Object.keys(row).forEach((key, colIndex) => {
        excelRow.getCell(colIndex + 1).value = row[key];
      });
    });

    // Guardar el archivo generado
    const outputPath = path.join(this.generatedPath, outputFileName);
    await workbook.xlsx.writeFile(outputPath);

    return outputPath;
  }

  async deleteTemplate(fileName: string): Promise<{ message: string }> {
    const filePath = path.join(this.templatesPath, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error('La plantilla no existe');
    }
    await fs.promises.unlink(filePath);
    return { message: 'Plantilla eliminada exitosamente' };
  }

  async cleanGeneratedFiles(): Promise<{ message: string }> {
    const files = await fs.promises.readdir(this.generatedPath);
    await Promise.all(
      files.map((file) =>
        fs.promises.unlink(path.join(this.generatedPath, file)),
      ),
    );
    return { message: 'Archivos generados limpiados exitosamente' };
  }
}
