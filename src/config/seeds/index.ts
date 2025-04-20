import { DataSource } from 'typeorm';
import { runAdminUserSeed } from './admin-user.seed';
import { runTeacherSeed } from './teacher.seed';
import { runRepresentativeSeed } from './representative.seed';
import { runStudentSeed } from './student.seed';
import { runSchoolYear2024Seed } from './school-year-2024.seed';
import { runCoursesSeed } from './courses.seed';

export const runSeeds = async (dataSource: DataSource): Promise<void> => {
  try {
    console.log('Ejecutando seeds...');

    // Seeds existentes
    await runAdminUserSeed(dataSource);

    // Seed de materias (debe ir antes del año escolar para poder asociar materias)
    await runCoursesSeed(dataSource);

    // Nuevos seeds
    await runTeacherSeed(dataSource);
    await runRepresentativeSeed(dataSource);
    await runStudentSeed(dataSource);
    await runSchoolYear2024Seed(dataSource);

    console.log('Seeds ejecutados exitosamente');
  } catch (error) {
    console.error('Error al ejecutar seeds:', error);
  }
};
