import { DataSource } from 'typeorm';
import { Evaluation } from '../../core/evaluations/entities/evaluation.entity';
import { SchoolCourt } from '../../core/school-year/entities/school-court.entity';
import { CourseSchoolYear } from '../../core/school-year/entities/course-school-year.entity';
import { EvaluationType } from '../../core/evaluations/entities/evaluation-type.enum';

/**
 * Agrega días a una fecha proporcionada como string y devuelve un objeto Date
 */
function addDaysToDate(dateString: string, days: number): Date {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

export const runEvaluationsSeed = async (dataSource: DataSource): Promise<void> => {
  try {
    console.log('Ejecutando seed de evaluaciones...');

    // Verificar si ya existen evaluaciones
    const evaluationsRepository = dataSource.getRepository(Evaluation);
    const existingEvaluations = await evaluationsRepository.find();

    if (existingEvaluations.length > 0) {
      console.log(`Ya existen ${existingEvaluations.length} evaluaciones en la base de datos.`);
      return;
    }

    // Obtener todas las materias-año escolar
    const courseSchoolYearRepository = dataSource.getRepository(CourseSchoolYear);
    const courseSchoolYears = await courseSchoolYearRepository.find();

    if (!courseSchoolYears.length) {
      console.log('No se encontraron materias-año escolar para crear evaluaciones.');
      return;
    }

    // Obtener todos los cortes escolares y sus lapsos
    const schoolCourtRepository = dataSource.getRepository(SchoolCourt);
    const schoolCourts = await schoolCourtRepository.find({
      relations: ['schoolLapse'],
      order: {
        courtNumber: 'ASC',
      },
    });

    if (!schoolCourts.length) {
      console.log('No se encontraron cortes escolares para crear evaluaciones.');
      return;
    }

    // Agrupar cortes por lapso para calcular porcentajes
    const courtsByLapse: Record<number, SchoolCourt[]> = {};
    
    schoolCourts.forEach((court) => {
      const lapseId = court.schoolLapse.id;
      
      if (!courtsByLapse[lapseId]) {
        courtsByLapse[lapseId] = [];
      }
      
      courtsByLapse[lapseId].push(court);
    });

    // Crear evaluaciones para cada materia-año escolar y cada lapso
    const evaluationsToSave: Evaluation[] = [];

    for (const courseSchoolYear of courseSchoolYears) {
      // Por cada lapso
      for (const lapseIdStr of Object.keys(courtsByLapse)) {
        const lapseId = parseInt(lapseIdStr, 10);
        const courts = courtsByLapse[lapseId];
        
        // Organizar porcentajes para que sumen 100%
        for (let i = 0; i < courts.length; i++) {
          const court = courts[i];
          // Convertir courtNumber a número para comparaciones
          const courtNumber = parseInt(court.courtNumber.toString(), 10);
          
          // Determinar los porcentajes según la posición del corte en el lapso
          let taskPercentage = 15;
          let examPercentage = 15;
          
          // Ajustar porcentajes para el último corte (agregar examen de lapso)
          if (i === courts.length - 1) {
            taskPercentage = 10;
            examPercentage = 10;
          }
          
          // Tarea
          const task = new Evaluation();
          task.name = `Tarea ${courtNumber}`;
          task.percentage = taskPercentage;
          task.type = EvaluationType.TASK;
          task.correlative = 1;
          task.projectedDate = addDaysToDate(court.startDate, 7); // 7 días después del inicio del corte
          task.courseSchoolYearId = courseSchoolYear.id;
          task.schoolCourtId = court.id;
          evaluationsToSave.push(task);
          
          // Examen
          const exam = new Evaluation();
          exam.name = `Examen ${courtNumber}`;
          exam.percentage = examPercentage;
          exam.type = EvaluationType.EXAM;
          exam.correlative = 2;
          exam.projectedDate = addDaysToDate(court.endDate, -2); // 2 días antes del fin del corte
          exam.courseSchoolYearId = courseSchoolYear.id;
          exam.schoolCourtId = court.id;
          evaluationsToSave.push(exam);
          
          // Agregar examen de lapso para el último corte
          if (i === courts.length - 1) {
            const lapseExam = new Evaluation();
            lapseExam.name = `Examen de Lapso ${lapseId}`;
            lapseExam.percentage = 20; // 20% para el examen de lapso
            lapseExam.type = EvaluationType.LAPSE_EXAM;
            lapseExam.correlative = 3;
            lapseExam.projectedDate = new Date(court.endDate); // Convertir string a Date
            lapseExam.courseSchoolYearId = courseSchoolYear.id;
            lapseExam.schoolCourtId = court.id;
            evaluationsToSave.push(lapseExam);
          }
        }
      }
    }

    // Guardar todas las evaluaciones
    await evaluationsRepository.save(evaluationsToSave);
    console.log(`Se crearon ${evaluationsToSave.length} evaluaciones.`);

  } catch (error) {
    console.error('Error al ejecutar seed de evaluaciones:', error);
  }
}; 