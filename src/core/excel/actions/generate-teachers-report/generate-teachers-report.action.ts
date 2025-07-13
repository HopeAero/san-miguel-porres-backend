import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import envConfig from '@/config/environment';
import { Environments } from '@/config/config.enums';
import { ContractsService } from '../../../contracts/contracts.service';
import { DateOrganizedPathHelper } from '../../helpers/date-organized-path.helper';

@Injectable()
export class GenerateTeachersReportAction {
  private readonly templatesPath: string;
  private readonly generatedPath: string;

  constructor(private readonly contractsService: ContractsService) {
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
      this.templatesPath = path.join(__dirname, '..', '..', 'templates');
      this.generatedPath = path.join(__dirname, '..', '..', 'generated');
    }
  }

  async execute(): Promise<{
    fileName: string;
    filePath: string;
  }> {
    const templateName = 'REGISTRO DE DOCENTES.xlsx';
    const templatePath = path.join(this.templatesPath, templateName);

    if (!fs.existsSync(templatePath)) {
      throw new Error('Template de registro de docentes no encontrado');
    }

    console.log('📄 Template encontrado:', templatePath);

    // Obtener datos de contratos de profesores
    const professorsContracts =
      await this.contractsService.findAllProfessorsForReport();

    console.log(
      '👨‍🏫 Contratos de profesores encontrados:',
      professorsContracts.length,
    );

    // Cargar la plantilla
    const workbook = new ExcelJS.Workbook();

    try {
      // Intentar leer como archivo Excel (.xls/.xlsx)
      await workbook.xlsx.readFile(templatePath);
      console.log('📊 Workbook cargado exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar el workbook:', error.message);
      throw new Error(`No se pudo cargar el template Excel: ${error.message}`);
    }

    // Verificar hojas de trabajo disponibles
    console.log('📋 Número de hojas de trabajo:', workbook.worksheets.length);
    console.log(
      '📋 Nombres de hojas:',
      workbook.worksheets.map((ws) => ws.name),
    );

    // Intentar obtener la primera hoja de trabajo
    let worksheet = workbook.getWorksheet(1);

    if (!worksheet && workbook.worksheets.length > 0) {
      // Si no hay hoja en índice 1, usar la primera disponible
      worksheet = workbook.worksheets[0];
      console.log('📋 Usando la primera hoja disponible:', worksheet.name);
    }

    if (!worksheet) {
      throw new Error('No se encontraron hojas de trabajo en el template');
    }

    console.log('📋 Hoja de trabajo seleccionada:', worksheet.name);
    console.log(
      '📏 Dimensiones de la hoja:',
      `${worksheet.rowCount} filas x ${worksheet.columnCount} columnas`,
    );

    // Llenar los datos a partir de la fila 3 (asumiendo que las primeras 2 filas son encabezados)
    let currentRow = 2;

    for (const contract of professorsContracts) {
      if (contract.employee?.person) {
        const row = worksheet.getRow(currentRow);

        // Mapear los datos a las columnas del Excel
        // MES | FEBRERO | AÑO | 202X | CÉDULA | CARGO | NIVEL | HORAS | HORAS | CATEGO | AÑOS SERVICIO | COSTO HORA | SALARIO MES | JERARQUÍA | ANTIGÜEDAD | TRANSPORTE | EJERCICIO DOCENTE | POSTGRADO | total mes
        row.getCell(1).value = currentRow - 1; // Número secuencial
        row.getCell(2).value =
          `${contract.employee.person.name || ''} ${contract.employee.person.lastName || ''}`.trim();
        row.getCell(3).value = contract.employee.person.dni || '';
        row.getCell(4).value = contract.position || ''; // CARGO
        row.getCell(5).value = contract.level || ''; // NIVEL
        row.getCell(6).value = contract.workingHours?.toString() || '0'; // HORAS
        row.getCell(7).value = contract.hoursWorked?.toString() || '0'; // HORAS TRABAJADAS
        row.getCell(8).value = contract.category || ''; // CATEGORÍA
        row.getCell(9).value = contract.yearsOfService || 0; // AÑOS SERVICIO
        row.getCell(11).value = contract.hourlyCost?.toString() || '0'; // COSTO HORA
        row.getCell(13).value = contract.monthlySalary?.toString() || '0'; // SALARIO MES
        row.getCell(14).value = contract.hierarchy?.toString() || '0'; // JERARQUÍA
        row.getCell(15).value = contract.antique?.toString() || '0'; // ANTIGÜEDAD
        row.getCell(16).value = contract.transport ? 'Sí' : 'No'; // TRANSPORTE
        row.getCell(17).value = contract.teachingExercise?.toString() || '0'; // EJERCICIO DOCENTE
        row.getCell(21).value = contract.postgraduate?.toString() || '0'; // POSTGRADO
        row.getCell(22).value = contract.totalSalary?.toString() || '0'; // TOTAL MES
        row.getCell(24).value = contract.nroOfChildren || 0; // N° HIJOS
        row.getCell(25).value = contract.totalSalary?.toString() || '0'; // TOTAL MES

        currentRow++;
      }
    }

    console.log('✏️ Datos llenados en', currentRow - 3, 'filas');

    // Generar nombre único para el archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFileName = `registro_docentes_${timestamp}.xlsx`;

    // Usar el helper para generar la ruta organizada por fecha
    const { organizedPath, fullFilePath } =
      DateOrganizedPathHelper.generateCompleteFilePath(
        this.generatedPath,
        outputFileName,
      );

    try {
      // Guardar el archivo generado en la ruta organizada
      await workbook.xlsx.writeFile(fullFilePath);
      console.log('💾 Archivo guardado exitosamente:', fullFilePath);
      console.log('📁 Organizado en:', organizedPath);
    } catch (error) {
      console.error('❌ Error al guardar el archivo:', error.message);
      throw new Error(`No se pudo guardar el archivo: ${error.message}`);
    }

    return {
      fileName: outputFileName,
      filePath: fullFilePath,
    };
  }
}
