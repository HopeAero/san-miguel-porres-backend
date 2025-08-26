import * as path from 'path';
import * as fs from 'fs';

/**
 * Helper para generar rutas organizadas por fecha
 * Estructura: basePath/YYYY-MM/DD/
 */
export class DateOrganizedPathHelper {
  /**
   * Genera la ruta organizada por fecha actual
   * @param basePath Ruta base (ej: generated)
   * @returns Ruta completa organizada por fecha
   */
  static generateOrganizedPath(
    basePath: string,
    options?: {
      category?: string; // Ejemplo: 'nomina', 'anexos', etc.
      subcategory?: string; // Ejemplo: 'profesores', 'administrativos', etc.
    },
  ): string {
    const now = new Date();

    // Formatear año-mes (YYYY-MM)
    const yearMonth = now.toISOString().slice(0, 7); // "2025-01"

    // Formatear día (DD)
    const day = now.getDate().toString().padStart(2, '0'); // "01", "02", etc.

    // Construir la ruta base con fecha
    let organizedPath = path.join(basePath, yearMonth, day);

    // Agregar categorías si se proporcionan
    if (options?.category) {
      organizedPath = path.join(organizedPath, options.category);

      if (options?.subcategory) {
        organizedPath = path.join(organizedPath, options.subcategory);
      }
    }

    return organizedPath;
  }

  /**
   * Crea las carpetas necesarias si no existen
   * @param organizedPath Ruta organizada generada por generateOrganizedPath
   */
  static ensureDirectoryExists(organizedPath: string): void {
    if (!fs.existsSync(organizedPath)) {
      fs.mkdirSync(organizedPath, { recursive: true });
      console.log('📁 Carpeta creada:', organizedPath);
    }
  }

  /**
   * Genera la ruta completa del archivo con organización por fecha
   * @param basePath Ruta base
   * @param fileName Nombre del archivo
   * @returns Objeto con la ruta organizada y la ruta completa del archivo
   */
  static generateCompleteFilePath(
    basePath: string,
    fileName: string,
    options?: {
      category?: string;
      subcategory?: string;
    },
  ): {
    organizedPath: string;
    fullFilePath: string;
  } {
    const organizedPath = this.generateOrganizedPath(basePath, options);
    this.ensureDirectoryExists(organizedPath);

    const fullFilePath = path.join(organizedPath, fileName);

    return {
      organizedPath,
      fullFilePath,
    };
  }
}
