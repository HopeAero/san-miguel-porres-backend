import { Environments } from '@/config/config.enums';
import envConfig from '@/config/environment';
import { ContractsService } from '@/core/contracts/contracts.service';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import { DateOrganizedPathHelper } from '../../helpers/date-organized-path.helper';

@Injectable()
export class GenerateWorkersPayrollAction {
  private readonly templatesPath: string;
  private readonly generatedPath: string;

  constructor(private readonly contractsService: ContractsService) {
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
    const templateName = 'NOMINA DE PAGO PERSONAL ADMINISTRATIVO.xlsx';

    const templatePath = path.join(this.templatesPath, templateName);

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        'Template de nomina de pago personal directivo docente no encontrado',
      );
    }

    console.log('📄 Template encontrado:', templatePath);

    const workersContracts =
      await this.contractsService.findAllWorkersForReport();

    let currentRow = 11;
    const maxRows = 5; // Solo 5 empleados por página (filas 11-15)
    const results: Array<{ fileName: string; filePath: string }> = [];
    const totalGroups = Math.ceil(workersContracts.length / maxRows);

    for (let group = 0; group < totalGroups; group++) {
      const workbook = new ExcelJS.Workbook();

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

      // Crear fórmulas master para las sumas
      const columns = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

      for (const col of columns) {
        const masterCell = worksheet.getCell(`${col}16`);
        masterCell.value = {
          formula: `=SUM(${col}11:${col}15)`,
        };
        masterCell.numFmt = '#,##0.00';
      }

      worksheet.getCell('G19').value = {
        formula: `=G16*9/4`,
      };

      worksheet.getCell('H19').value = {
        formula: `=H16*2/0.5`,
      };

      worksheet.getCell('I19').value = {
        formula: `=I16*2`,
      };

      worksheet.getCell('J19').value = {
        formula: `=F16*2%`,
      };

      currentRow = 11; // Reiniciar la fila para cada grupo
      const startIdx = group * maxRows;
      const endIdx = Math.min((group + 1) * maxRows, workersContracts.length);
      const groupContracts = workersContracts.slice(startIdx, endIdx);

      for (const contract of groupContracts) {
        if (contract.employee?.person) {
          const row = worksheet.getRow(currentRow);

          // Calcular el número secuencial considerando el grupo actual
          const sequentialNumber = group * maxRows + (currentRow - 10);

          // Datos básicos
          row.getCell('A').value = sequentialNumber.toString();
          row.getCell('B').value =
            `${contract.employee.person.name || ''} ${contract.employee.person.lastName || ''}`.trim();
          row.getCell('C').value = contract.employee.person.dni || '';
          row.getCell('D').value = contract.monthlySalary?.toNumber() || 0;
          row.getCell('E').value = 0; // Prima por anexo
          row.getCell('F').value = {
            formula: `=SUM(D${currentRow}:E${currentRow})`,
          }; //Total Asignaciones 3 + 4
          row.getCell('G').value = { formula: `=F${currentRow}*0.04` };
          row.getCell('H').value = { formula: `=F${currentRow}*0.005` };
          row.getCell('I').value = { formula: `=F${currentRow}*0.01` };
          row.getCell('J').value = 0; // Deducciones
          row.getCell('K').value = {
            formula: `=SUM(G${currentRow} + H${currentRow} + I${currentRow} + J${currentRow})`,
          }; // Total asignaciones
          row.getCell('L').value = {
            formula: `=F${currentRow}-K${currentRow}`,
          }; // Total a recibir
          row.getCell('M').value = { formula: `=(F${currentRow}/30*1.924)*5` }; // PROVISION MENSUAL DE PRESTACIONES SOCIALES
          row.getCell('N').value = {
            formula: `=(F${currentRow}/30+1.924)*15`, // APORTE PREST.SOCIALES A DEPOSITAR ENFIDEICOMISO
          };

          // Asegurar formato numérico para montos
          ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].forEach(
            (col) => {
              const cell = row.getCell(col);
              cell.numFmt = '#,##0.00';
            },
          );

          currentRow++;
        }
      }

      // Generar nombre único para el archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFileName = `nomina_pago_administrativo_grupo${group + 1}_${timestamp}.xlsx`;

      // Usar el helper para generar la ruta organizada por fecha
      const { organizedPath, fullFilePath } =
        DateOrganizedPathHelper.generateCompleteFilePath(
          this.generatedPath,
          outputFileName,
          {
            category: 'nomina',
            subcategory: 'administrativo',
          },
        );

      try {
        // Guardar el archivo generado en la ruta organizada
        await workbook.xlsx.writeFile(fullFilePath);
        console.log('💾 Archivo guardado exitosamente:', fullFilePath);
        console.log('📁 Organizado en:', organizedPath);

        results.push({
          fileName: outputFileName,
          filePath: fullFilePath,
        });
      } catch (error) {
        console.error('❌ Error al guardar el archivo:', error.message);
        throw new Error(`No se pudo guardar el archivo: ${error.message}`);
      }
    }

    const annexResults = await this.generateAnnexSheet();

    return [...results, ...annexResults];
  }

  async generateAnnexSheet() {
    const templateName = 'ANEXO NOMINA DE PAGO PERSONAL ADMINISTRATIVO.xlsx';
    const templatePath = path.join(this.templatesPath, templateName);

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        'Template de anexo de nomina de pago personal administrativo no encontrado',
      );
    }

    console.log('📄 Template de anexo encontrado:', templatePath);

    const workersContracts =
      await this.contractsService.findAllWorkersForReport();

    let currentRow = 11;
    const maxRows = 16; // Solo 5 empleados por página (filas 11-27 )
    const results: Array<{ fileName: string; filePath: string }> = [];
    const totalGroups = Math.ceil(workersContracts.length / maxRows);

    for (let group = 0; group < totalGroups; group++) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);
      console.log(`📊 Workbook ${group + 1} cargado exitosamente`);

      let worksheet = workbook.getWorksheet(1);

      if (!worksheet && workbook.worksheets.length > 0) {
        worksheet = workbook.worksheets[0];
      }

      if (!worksheet) {
        throw new Error('No se encontraron hojas de trabajo en el template');
      }

      const columns = ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];

      for (const col of columns) {
        const masterCell = worksheet.getCell(`${col}30`);
        masterCell.value = {
          formula: `=SUM(${col}11:${col}27)`,
        };
      }

      currentRow = 11; // Reiniciar la fila para cada grupo
      const startIdx = group * maxRows;
      const endIdx = Math.min((group + 1) * maxRows, workersContracts.length);
      const groupContracts = workersContracts.slice(startIdx, endIdx);

      for (const contract of groupContracts) {
        if (contract.employee?.person) {
          const row = worksheet.getRow(currentRow);

          // Calcular el número secuencial considerando el grupo actual
          const sequentialNumber = group * maxRows + (currentRow - 10);

          // Datos básicos
          row.getCell('A').value = sequentialNumber;
          row.getCell('B').value =
            `${contract.employee.person.name || ''} ${contract.employee.person.lastName || ''}`.trim();
          row.getCell('C').value = contract.employee.person.dni || '';
          row.getCell('D').value = contract.position || '';
          row.getCell('E').value = contract.qualification || '';
          row.getCell('F').value = '';
          row.getCell('G').value = '';
          row.getCell('H').value = contract.yearsOfServiceExternal || 0;
          row.getCell('I').value = contract.yearsOfServiceAvec || 0;
          row.getCell('J').value = contract.yearsOfServiceOtherAvec || 0;
          row.getCell('K').value = contract.grade || '';
          switch (contract.level) {
            case 'Nivel 1':
              row.getCell('L').value = 'I';
              row.getCell('M').value = '';
              row.getCell('N').value = '';
              row.getCell('O').value = '';
              break;
            case 'Nivel 2':
              row.getCell('L').value = '';
              row.getCell('M').value = 'II';
              row.getCell('N').value = '';
              row.getCell('O').value = '';
              break;
            case 'Nivel 3':
              row.getCell('L').value = '';
              row.getCell('M').value = '';
              row.getCell('N').value = 'III';
              row.getCell('O').value = '';
              break;
            case 'Nivel 4':
              row.getCell('L').value = '';
              row.getCell('M').value = '';
              row.getCell('N').value = '';
              row.getCell('O').value = 'IV';
              break;
            case 'Nivel 5':
              row.getCell('L').value = '';
              row.getCell('M').value = '';
              row.getCell('N').value = '';
              row.getCell('O').value = 'V';
              break;
          }
          row.getCell('P').value = contract.workingHours?.toNumber() || 0;
          row.getCell('Q').value = contract.nightBonus?.toNumber() || 0;
          row.getCell('R').value = contract.antique?.toNumber() || 0;
          row.getCell('S').value = contract.geography?.toNumber() || 0;
          row.getCell('T').value = contract.bonusAcademic?.toNumber() || 0;
          row.getCell('U').value = 22.5;
          row.getCell('V').value = 0; // PRIMA AYUDA ASISTENCIAL DEL HOGAR EL 10% SOBRE EL SALARIO MINIMO LEGAL ESTABLECIDO (SALARIO MINIMO + CESTATICKTS). CARÁCTER SALARIAL.
          row.getCell('W').value = contract.bonusForChildren?.toNumber() || 0; // PRIMA POR HIJO
          row.getCell('X').value = contract.bonusDisability?.toNumber() || 0; // PRIMA POR DISCAPACIDAD
          row.getCell('Y').value = {
            formula: `=SUM(Q${currentRow} + R${currentRow} + S${currentRow} + T${currentRow} + U${currentRow} + V${currentRow} + W${currentRow} + X${currentRow})`,
          };

          currentRow++;
        }
      }

      // Generar nombre único para el archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFileName = `anexo_nomina_pago_administrativo_grupo${group + 1}_${timestamp}.xlsx`;

      // Usar el helper para generar la ruta organizada por fecha
      const { organizedPath, fullFilePath } =
        DateOrganizedPathHelper.generateCompleteFilePath(
          this.generatedPath,
          outputFileName,
          {
            category: 'nomina',
            subcategory: 'administrativo',
          },
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
    }

    return results;
  }
}
