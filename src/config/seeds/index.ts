import { DataSource } from 'typeorm';
import { runAdminUserSeed } from './admin-user.seed';

export const runSeeds = async (dataSource: DataSource): Promise<void> => {
  try {
    // Ejecutar todos los seeders
    await runAdminUserSeed(dataSource);

    console.log('Seeders ejecutados exitosamente');
  } catch (error) {
    console.error('Error al ejecutar seeders:', error);
    throw error;
  }
};
