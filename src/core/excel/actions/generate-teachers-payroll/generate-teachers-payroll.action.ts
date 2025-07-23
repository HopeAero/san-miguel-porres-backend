import { Environments } from '@/config/config.enums';
import envConfig from '@/config/environment';
import { ContractsService } from '@/core/contracts/contracts.service';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { DateOrganizedPathHelper } from '../../helpers/date-organized-path.helper';
import { ContractProfessor } from '@/core/contracts/entities/contract-profesor.entity';

@Injectable()
export class GenerateTeachersPayrollAction {
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

  async execute(): Promise<
    Array<{
      fileName: string;
      filePath: string;
    }>
  > {
    const templateName = 'NOMINA DE PAGO PERSONAL DIRECTIVO DOCENTE.xlsx';
    const templatePath = path.join(this.templatesPath, templateName);

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        'Template de nomina de pago personal directivo docente no encontrado',
      );
    }

    console.log('📄 Template encontrado:', templatePath);
    // Obtener datos de contratos de profesores
    const professorsContracts =
      await this.contractsService.findAllProfessorsForReport();

    let currentRow = 11;
    const maxRows = 17;
    const results: Array<{ fileName: string; filePath: string }> = [];
    const totalGroups = Math.ceil(professorsContracts.length / maxRows);

    for (let group = 0; group < totalGroups; group++) {
      // Crear nuevo workbook para cada grupo
      const workbook = new ExcelJS.Workbook();

      try {
        await workbook.xlsx.readFile(templatePath);
        console.log(`📊 Workbook ${group + 1} cargado exitosamente`);

        // Asegurarnos de trabajar solo con la primera hoja
        while (workbook.worksheets.length > 1) {
          workbook.removeWorksheet(workbook.worksheets[1].id);
        }

        let worksheet = workbook.getWorksheet(1);

        if (!worksheet && workbook.worksheets.length > 0) {
          worksheet = workbook.worksheets[0];
        }

        if (!worksheet) {
          throw new Error('No se encontraron hojas de trabajo en el template');
        }

        // Crear fórmulas master para las sumas de D hasta P
        const columns = [
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
          'N',
          'O',
          'P',
        ];

        for (const col of columns) {
          const masterCell = worksheet.getCell(`${col}28`);
          masterCell.value = {
            formula: `=SUM(${col}11:${col}27)`,
          };
        }

        worksheet.getCell('G31').value = {
          formula: `=G28*9/4`,
        };

        worksheet.getCell('H31').value = {
          formula: `=H28*2/0.5`,
        };

        worksheet.getCell('I31').value = {
          formula: `=I28*2`,
        };

        worksheet.getCell('J31').value = {
          formula: `=F28*2%`,
        };

        currentRow = 11; // Reiniciar la fila para cada grupo
        const startIdx = group * maxRows;
        const endIdx = Math.min(
          (group + 1) * maxRows,
          professorsContracts.length,
        );
        const groupContracts = professorsContracts.slice(startIdx, endIdx);

        for (const contract of groupContracts) {
          if (contract.employee?.person) {
            const row = worksheet.getRow(currentRow);
            // Calcular el número secuencial considerando el grupo actual
            const sequentialNumber = group * maxRows + (currentRow - 10);
            row.getCell(1).value = sequentialNumber;
            row.getCell(2).value =
              `${contract.employee.person.name || ''} ${contract.employee.person.lastName || ''}`.trim();
            row.getCell(3).value = contract.employee.person.dni || '';
            row.getCell(4).value = contract.monthlySalary?.toNumber() || 0;
            row.getCell(5).value = 0;
            row.getCell(6).value = {
              formula: `=D${currentRow}+E${currentRow}`,
            };
            row.getCell(7).value = { formula: `=F${currentRow}*0.04` };
            row.getCell(8).value = { formula: `=F${currentRow}*0.005` };
            row.getCell(9).value = { formula: `=F${currentRow}*0.01` };
            row.getCell(10).value = 0;
            row.getCell(11).value = {
              formula: `=G${currentRow}+H${currentRow}+I${currentRow}+J${currentRow}`,
            };
            row.getCell(12).value = {
              formula: `=F${currentRow}-K${currentRow}`,
            };
            row.getCell(13).value = { formula: `=(F${currentRow}/30*1.728)*5` };
            row.getCell(14).value = {
              formula: `=(F${currentRow}/30*1.728)*15`,
            };
            currentRow++;
          }
        }

        // Agregar hoja del anexo
        await this.addAnnexSheet(workbook, groupContracts, group, maxRows);

        // Generar nombre único para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFileName = `nomina_pago_docentes_grupo${group + 1}_${timestamp}.xlsx`;

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

        results.push({
          fileName: outputFileName,
          filePath: fullFilePath,
        });
      } catch (error) {
        console.error('❌ Error al cargar el workbook:', error.message);
        throw new Error(
          `No se pudo cargar el template Excel: ${error.message}`,
        );
      }
    }

    return results;
  }

  /**
   * Agrega una hoja del anexo al workbook existente
   */
  private async addAnnexSheet(
    workbook: ExcelJS.Workbook,
    groupContracts: ContractProfessor[],
    group: number,
    maxRows: number,
  ): Promise<void> {
    const annexTemplateName =
      'ANEXO NOMINA DE PAGO PERSONAL ADMINISTRATIVO.xlsx';
    const annexTemplatePath = path.join(this.templatesPath, annexTemplateName);

    if (!fs.existsSync(annexTemplatePath)) {
      console.warn(`⚠️ Plantilla de anexo no encontrada: ${annexTemplateName}`);
      return;
    }

    console.log('📄 Cargando plantilla de anexo:', annexTemplateName);

    try {
      // Cargar la plantilla del anexo
      const annexWorkbook = new ExcelJS.Workbook();
      await annexWorkbook.xlsx.readFile(annexTemplatePath);

      const annexWorksheet = annexWorkbook.getWorksheet(1);
      if (!annexWorksheet) {
        console.error(
          '❌ No se pudo acceder a la hoja de la plantilla del anexo',
        );
        return;
      }

      // Crear nueva hoja en el workbook principal
      const newWorksheet = workbook.addWorksheet('Anexo Administrativo');

      // Copiar estructura y formato de la plantilla del anexo
      annexWorksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const newRow = newWorksheet.getRow(rowNumber);

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const newCell = newRow.getCell(colNumber);

          // Copiar valor
          newCell.value = cell.value;

          // Copiar estilo básico
          if (cell.style) {
            newCell.style = {
              font: cell.font,
              fill: cell.fill,
              border: cell.border,
              alignment: cell.alignment,
              numFmt: cell.numFmt,
            };
          }
        });

        // Copiar altura de fila
        if (row.height) {
          newRow.height = row.height;
        }
      });

      // Copiar anchos de columna
      annexWorksheet.columns.forEach((column, index) => {
        if (column.width) {
          newWorksheet.getColumn(index + 1).width = column.width;
        }
      });

      // Llenar datos desde la fila 11 (ajustar según tu plantilla)
      let currentRow = 11;
      for (const contract of groupContracts) {
        if (contract.employee?.person) {
          const row = newWorksheet.getRow(currentRow);

          // Calcular el número secuencial igual que en la hoja principal
          const sequentialNumber = group * maxRows + (currentRow - 10);

          // Ajustar estos campos según la estructura de tu plantilla de anexo
          row.getCell(1).value = sequentialNumber; // N° secuencial
          row.getCell(2).value =
            `${contract.employee.person.name || ''} ${contract.employee.person.lastName || ''}`.trim();
          row.getCell(3).value = contract.employee.person.dni || '';
          row.getCell(4).value = contract.position || '';
          row.getCell(5).value = contract.monthlySalary?.toNumber() || 0;
          row.getCell(6).value = contract.totalSalary?.toNumber() || 0;

          // Agregar más campos según necesites...
          currentRow++;
        }
      }

      console.log('✅ Hoja de anexo agregada exitosamente');
    } catch (error) {
      console.error('❌ Error al agregar hoja de anexo:', error.message);
    }
  }
}
