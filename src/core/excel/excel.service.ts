import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import envConfig from '@/config/environment';
import { Environments } from '@/config/config.enums';
import {
  GenerateTeachersPayrollAction,
  GenerateTeachersReportAction,
  GenerateWorkersReportAction,
} from './actions';
import { DateOrganizedPathHelper } from './helpers/date-organized-path.helper';
import { GenerateWorkersPayrollAction } from './actions/generate-workers-payroll/generate-workers-payroll.action';

@Injectable()
export class ExcelService {
  private readonly templatesPath: string;
  private readonly generatedPath: string;

  constructor(
    private readonly generateTeachersReportAction: GenerateTeachersReportAction,
    private readonly generateWorkersReportAction: GenerateWorkersReportAction,
    private readonly generateTeachersPayrollAction: GenerateTeachersPayrollAction,
    private readonly generateWorkersPayrollAction: GenerateWorkersPayrollAction,
  ) {
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
      this.generatedPath = path.join(
        process.cwd(),
        'src',
        'core',
        'excel',
        'generated',
      );
    } else {
      // En producción, usar la ruta compilada
      this.templatesPath = path.join(__dirname, 'templates');
      this.generatedPath = path.join(__dirname, 'generated');
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

  async getGeneratedFilesList(): Promise<
    {
      fileName: string;
      filePath: string;
      date: string;
    }[]
  > {
    try {
      const result: { fileName: string; filePath: string; date: string }[] = [];

      // Función recursiva para buscar archivos en subcarpetas
      const searchFiles = async (
        currentPath: string,
        basePath: string = '',
      ) => {
        const items = await fs.promises.readdir(currentPath, {
          withFileTypes: true,
        });

        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          const relativePath = path.join(basePath, item.name);

          if (item.isDirectory()) {
            // Buscar recursivamente en subdirectorios
            await searchFiles(fullPath, relativePath);
          } else if (item.isFile() && item.name.endsWith('.xlsx')) {
            // Extraer fecha del path (formato: YYYY-MM/DD)
            const pathParts = relativePath.split(path.sep);
            let dateInfo = 'Sin fecha';

            if (pathParts.length >= 2) {
              const yearMonth = pathParts[0]; // "2025-01"
              const day = pathParts[1]; // "01"
              dateInfo = `${yearMonth}-${day}`; // "2025-01-01"
            }

            result.push({
              fileName: item.name,
              filePath: fullPath,
              date: dateInfo,
            });
          }
        }
      };

      await searchFiles(this.generatedPath);

      // Ordenar por fecha (más recientes primero)
      result.sort((a, b) => b.date.localeCompare(a.date));

      return result;
    } catch (error) {
      console.error('Error leyendo directorio de archivos generados:', error);
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

    // Usar el helper para generar la ruta organizada por fecha
    const { fullFilePath } = DateOrganizedPathHelper.generateCompleteFilePath(
      this.generatedPath,
      outputFileName,
    );

    // Guardar el archivo generado en la ruta organizada
    await workbook.xlsx.writeFile(fullFilePath);

    return fullFilePath;
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
    // Función recursiva para eliminar archivos y carpetas
    const cleanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.promises.readdir(dirPath, {
          withFileTypes: true,
        });

        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);

          if (item.isDirectory()) {
            // Limpiar recursivamente y luego eliminar la carpeta vacía
            await cleanDirectory(fullPath);
            await fs.promises.rmdir(fullPath);
          } else {
            // Eliminar archivo
            await fs.promises.unlink(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Error limpiando directorio ${dirPath}:`, error.message);
      }
    };

    await cleanDirectory(this.generatedPath);
    return { message: 'Archivos generados limpiados exitosamente' };
  }

  /**
   * Obtiene la ruta completa de un archivo generado buscando en la estructura organizada
   * @param fileName Nombre del archivo
   * @returns Ruta completa del archivo
   * @throws Error si el archivo no existe
   */
  async getGeneratedFilePath(fileName: string): Promise<string> {
    // Función recursiva para buscar el archivo en subcarpetas
    const searchFile = async (currentPath: string): Promise<string | null> => {
      try {
        const items = await fs.promises.readdir(currentPath, {
          withFileTypes: true,
        });

        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);

          if (item.isDirectory()) {
            // Buscar recursivamente en subdirectorios
            const result = await searchFile(fullPath);
            if (result) return result;
          } else if (item.isFile() && item.name === fileName) {
            // Archivo encontrado
            return fullPath;
          }
        }
        return null;
      } catch {
        return null;
      }
    };

    const filePath = await searchFile(this.generatedPath);

    if (!filePath) {
      throw new Error(`Archivo ${fileName} no encontrado`);
    }

    return filePath;
  }

  async generateTeachersReport(): Promise<{
    fileName: string;
    filePath: string;
  }> {
    return this.generateTeachersReportAction.execute();
  }

  async generateWorkersReport(): Promise<{
    fileName: string;
    filePath: string;
  }> {
    return this.generateWorkersReportAction.execute();
  }

  async generateTeachersPayroll(): Promise<
    Array<{
      fileName: string;
      filePath: string;
    }>
  > {
    return this.generateTeachersPayrollAction.execute();
  }

  async generateWorkersPayroll(): Promise<
    Array<{
      fileName: string;
      filePath: string;
    }>
  > {
    return this.generateWorkersPayrollAction.execute();
  }
}
