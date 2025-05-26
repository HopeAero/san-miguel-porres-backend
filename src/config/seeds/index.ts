import { DataSource } from 'typeorm';
import { runAdminUserSeed } from './admin-user.seed';
import { runTeacherSeed } from './teacher.seed';
import { runRepresentativeSeed } from './representative.seed';
import { runStudentSeed } from './student.seed';
import { runSchoolYear2024Seed } from './school-year-2024.seed';
import { runCoursesSeed } from './courses.seed';
import { runInscriptionsSeed } from './inscriptions.seed';
import { runEvaluationsSeed } from './evaluations.seed';

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
    
    // Seed de inscripciones (debe ir después de estudiantes y año escolar)
    await runInscriptionsSeed(dataSource);
    
    // Seed de evaluaciones (debe ir después de year escolar y cursos)
    await runEvaluationsSeed(dataSource);

    console.log('Seeds ejecutados exitosamente');
  } catch (error) {
    console.error('Error al ejecutar seeds:', error);
  }
};
