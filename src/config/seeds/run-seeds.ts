import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runSeeds } from './index';
import databaseConfig from '@/config/database.config';

// Cargar las variables de entorno
config();

// Crear una instancia de DataSource
const dataSource = new DataSource(databaseConfig);

// Función para inicializar la conexión y ejecutar los seeders
async function main() {
  try {
    // Inicializar la conexión a la base de datos
    await dataSource.initialize();
    console.log('Base de datos conectada');

    // Ejecutar los seeders
    await runSeeds(dataSource);

    // Cerrar la conexión a la base de datos
    await dataSource.destroy();
    console.log('Conexión a la base de datos cerrada');

    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar los seeders:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
