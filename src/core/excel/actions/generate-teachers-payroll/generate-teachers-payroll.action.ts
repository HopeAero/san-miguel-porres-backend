import { Environments } from '@/config/config.enums';
import envConfig from '@/config/environment';
import { ContractsService } from '@/core/contracts/contracts.service';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { DateOrganizedPathHelper } from '../../helpers/date-organized-path.helper';

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
            row.getCell(5).value =
              (contract.antique?.toNumber() || 0) + // Prima por antigüedad
              (contract.teachingExercise?.toNumber() || 0) + // Ejercicio docente
              (contract.geography?.toNumber() || 0) + // Prima geográfica
              (contract.postgraduate?.toNumber() || 0) + // Postgrado
              (contract.homeCareAssistance?.toNumber() || 0) + // Prima ayuda asistencial
              (contract.bonusForChildren?.toNumber() || 0) + // N° Hijos
              (contract.bonusDisability?.toNumber() || 0); // Prima por discapacidad
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

        // Generar nombre único para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFileName = `nomina_pago_docentes_grupo${group + 1}_${timestamp}.xlsx`;

        // Usar el helper para generar la ruta organizada por fecha
        const { organizedPath, fullFilePath } =
          DateOrganizedPathHelper.generateCompleteFilePath(
            this.generatedPath,
            outputFileName,
            {
              category: 'nomina',
              subcategory: 'profesores',
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
      } catch (error) {
        console.error('❌ Error al cargar el workbook:', error.message);
        throw new Error(
          `No se pudo cargar el template Excel: ${error.message}`,
        );
      }
    }

    // Generar los anexos y combinar los resultados
    const annexResults = await this.generateAnnexSheet();

    return [...results, ...annexResults];
  }

  /**
   * Genera los archivos de anexo y retorna sus rutas
   */
  private async generateAnnexSheet(): Promise<
    Array<{ fileName: string; filePath: string }>
  > {
    const results: Array<{ fileName: string; filePath: string }> = [];
    const annexTemplateName = 'ANEXO NOMINA DE PAGO PERSONAL DIRECTIVO.xlsx';
    const annexTemplatePath = path.join(this.templatesPath, annexTemplateName);

    if (!fs.existsSync(annexTemplatePath)) {
      console.warn(`⚠️ Plantilla de anexo no encontrada: ${annexTemplateName}`);
      return results;
    }

    try {
      // Obtener todos los contratos de profesores
      const professorsContracts =
        await this.contractsService.findAllProfessorsForReport();

      // Constantes para el manejo de grupos
      const ROWS_PER_GROUP = 60; // Dejamos espacio para encabezados y totales
      const totalProfessors = professorsContracts.length;
      const totalGroups = Math.ceil(totalProfessors / ROWS_PER_GROUP);

      console.log(
        `📊 Total de profesores: ${totalProfessors}, Grupos necesarios: ${totalGroups}`,
      );

      // Procesar cada grupo
      for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
        console.log(
          `\n📑 Procesando grupo ${groupIndex + 1} de ${totalGroups}`,
        );

        // Cargar plantilla fresca para cada grupo
        const annexWorkbook = new ExcelJS.Workbook();
        await annexWorkbook.xlsx.readFile(annexTemplatePath);

        // Asegurarnos de trabajar solo con la primera hoja
        while (annexWorkbook.worksheets.length > 1) {
          annexWorkbook.removeWorksheet(annexWorkbook.worksheets[1].id);
        }

        let annexWorksheet = annexWorkbook.getWorksheet(1);

        if (!annexWorksheet && annexWorkbook.worksheets.length > 0) {
          annexWorksheet = annexWorkbook.worksheets[0];
        }

        if (!annexWorksheet) {
          console.error(
            '❌ No se pudo acceder a la hoja de la plantilla del anexo',
          );
          continue;
        }

        // Calcular el rango de profesores para este grupo
        const startIndex = groupIndex * ROWS_PER_GROUP;
        const endIndex = Math.min(startIndex + ROWS_PER_GROUP, totalProfessors);
        const groupProfessors = professorsContracts.slice(startIndex, endIndex);

        console.log(
          `📝 Procesando profesores ${startIndex + 1} al ${endIndex}`,
        );

        // Llenar datos desde la fila 10
        let currentRow = 10;

        for (const contract of groupProfessors) {
          if (contract.employee?.person) {
            const row = annexWorksheet.getRow(currentRow);
            const sequentialNumber = startIndex + (currentRow - 9); // Numeración global

            console.log(
              `  👤 Profesor ${sequentialNumber}: ${contract.employee.person.name}`,
            );

            // Datos básicos
            row.getCell('A').value = sequentialNumber;
            row.getCell('B').value =
              `${contract.employee.person.name || ''} ${contract.employee.person.lastName || ''}`.trim();
            row.getCell('C').value = contract.position || '';
            row.getCell('D').value = 'X'; //Titulo docente pregrado
            row.getCell('E').value = 'X'; //Titulo docente posgrado

            // Formación (horas)
            row.getCell('F').value = 0; // Diploma educativo
            row.getCell('G').value = 0; // Puntaje

            // Experiencia laboral
            row.getCell('H').value = contract.workingHours?.toNumber() || 0; // Numero de horas semanales
            row.getCell('I').value = contract.hoursWorked?.toNumber() || 0; // Numero de horas semanales

            // Bonos y primas (columnas 4A-4H)
            row.getCell('J').value =
              Math.round(contract.hoursWorked?.toNumber()) || 0; // Total de horas trabajadas
            row.getCell('K').value = contract.category?.toString() || ''; // Categoria docente
            row.getCell('L').value = contract.yearsOfService || 0; // Tiempo de servicio en planteles privados (años)
            row.getCell('M').value = 0; // Tiempo de servicio en planteles privados (meses)
            row.getCell('N').value = contract.hourlyCost?.toNumber() || 0; // Costo hora
            row.getCell('O').value = contract.antique?.toNumber() || 0; // Prima por antiguedad
            row.getCell('P').value = contract.teachingExercise?.toNumber() || 0; // Ejercicio docente
            row.getCell('Q').value = contract.geography?.toNumber() || 0; // Primar geográfica
            row.getCell('R').value = contract.postgraduate?.toNumber() || 0; // Postgrado
            row.getCell('S').value =
              contract.homeCareAssistance?.toNumber() || 0; // Prima ayuda asistencial
            row.getCell('T').value = contract.bonusForChildren?.toNumber() || 0; // N° Hijos
            row.getCell('U').value = contract.bonusDisability?.toNumber() || 0; // Prima por discapacidad
            row.getCell('V').value = {
              formula: `=SUM(O${currentRow}+P${currentRow}+Q${currentRow}+R${currentRow}+S${currentRow}+T${currentRow}+U${currentRow})`,
            };
            row.getCell('W').value = 0;
            row.getCell('X').value = {
              formula: `=SUM(V${currentRow})`,
            };

            // Asegurar formato numérico para montos
            ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'].forEach((col) => {
              const cell = row.getCell(col);
              cell.numFmt = '#,##0.00';
            });
            currentRow++;
          }
        }

        // Generar nombre único para este grupo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `anexo_personal_directivo_grupo_${groupIndex + 1}_de_${totalGroups}_${timestamp}.xlsx`;

        // Usar el helper para generar la ruta organizada por fecha y categoría
        const { fullFilePath } =
          DateOrganizedPathHelper.generateCompleteFilePath(
            this.generatedPath,
            fileName,
            {
              category: 'nomina',
              subcategory: 'profesores',
            },
          );

        // Guardar archivo de este grupo
        await annexWorkbook.xlsx.writeFile(fullFilePath);

        // Agregar el archivo al array de resultados
        results.push({
          fileName: fileName,
          filePath: fullFilePath,
        });

        console.log(
          `✅ Archivo del grupo ${groupIndex + 1} generado:`,
          fileName,
        );
        console.log('📁 Guardado en:', fullFilePath);
      }

      console.log(
        `\n✅ Proceso completado. ${totalGroups} archivos generados.`,
      );
    } catch (error) {
      console.error('❌ Error al generar archivos de anexo:', error.message);
      throw new Error(`Error al generar archivos de anexo: ${error.message}`);
    }

    return results;
  }
}
