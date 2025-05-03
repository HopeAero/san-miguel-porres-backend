import { DataSource } from 'typeorm';
import { Student } from '@/core/people/student/entities/student.entity';
import { SchoolYear } from '@/core/school-year/entities/school-year.entity';
import { CourseSchoolYear } from '@/core/school-year/entities/course-school-year.entity';
import { Inscription } from '@/core/inscriptions/entities/inscription.entity';
import { CourseInscription } from '@/core/inscriptions/entities/course-inscription.entity';

export const runInscriptionsSeed = async (
  dataSource: DataSource,
): Promise<void> => {
  // Obtener los repositorios necesarios
  const studentRepository = dataSource.getRepository(Student);
  const schoolYearRepository = dataSource.getRepository(SchoolYear);
  const courseSchoolYearRepository = dataSource.getRepository(CourseSchoolYear);
  const inscriptionRepository = dataSource.getRepository(Inscription);
  const courseInscriptionRepository = dataSource.getRepository(CourseInscription);

  console.log('Iniciando seed de inscripciones...');

  // Verificar si ya existen inscripciones
  const existingInscriptions = await inscriptionRepository.count();
  if (existingInscriptions > 0) {
    console.log(`Ya existen ${existingInscriptions} inscripciones en la base de datos.`);
    return;
  }

  // Obtener el año escolar 2024
  const schoolYear = await schoolYearRepository.findOne({
    where: { code: '2024' },
  });

  if (!schoolYear) {
    console.log('No se encontró el año escolar 2024. Por favor, ejecute primero el seed de school-year-2024.');
    return;
  }

  // Obtener todos los estudiantes
  const students = await studentRepository.find({
    where: { deletedAt: null },
  });

  if (students.length === 0) {
    console.log('No se encontraron estudiantes. Por favor, ejecute primero el seed de estudiantes.');
    return;
  }

  console.log(`Se encontraron ${students.length} estudiantes disponibles.`);

  // Obtener todas las asignaturas por año escolar
  const courseSchoolYears = await courseSchoolYearRepository.find({
    where: { schoolYearId: schoolYear.id, deletedAt: null },
    relations: ['course'],
  });

  if (courseSchoolYears.length === 0) {
    console.log('No se encontraron asignaturas para el año escolar 2024.');
    return;
  }

  console.log(`Se encontraron ${courseSchoolYears.length} asignaturas para el año escolar 2024.`);

  // Agrupar asignaturas por grado
  const coursesByGrade = courseSchoolYears.reduce((acc, courseSchoolYear) => {
    const grade = courseSchoolYear.grade;
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(courseSchoolYear);
    return acc;
  }, {} as Record<number, CourseSchoolYear[]>);

  // Crear al menos 15 inscripciones
  const numberOfInscriptions = 15;
  const createdInscriptions: Inscription[] = [];

  // Seleccionar estudiantes aleatorios para inscripciones (al menos 15)
  const selectedStudentIds = new Set<number>();
  while (selectedStudentIds.size < numberOfInscriptions && selectedStudentIds.size < students.length) {
    const randomIndex = Math.floor(Math.random() * students.length);
    selectedStudentIds.add(students[randomIndex].id);
  }

  console.log(`Seleccionados ${selectedStudentIds.size} estudiantes para inscripciones.`);

  // Para cada estudiante seleccionado, crear una inscripción
  for (const studentId of selectedStudentIds) {
    // Seleccionar un grado aleatorio entre los disponibles (keys del objeto coursesByGrade)
    const availableGrades = Object.keys(coursesByGrade).map(Number);
    const randomGradeIndex = Math.floor(Math.random() * availableGrades.length);
    const selectedGrade = availableGrades[randomGradeIndex];

    // Crear la inscripción principal
    const inscription = inscriptionRepository.create({
      studentId: studentId,
      schoolYearId: schoolYear.id,
      grade: String(selectedGrade), // Convertir a string ya que en la entidad se espera un string
    });

    try {
      const savedInscription = await inscriptionRepository.save(inscription);
      console.log(`Inscripción creada para el estudiante ${studentId} en el grado ${selectedGrade}.`);
      
      createdInscriptions.push(savedInscription);

      // Obtener los cursos disponibles para el grado seleccionado
      const coursesForGrade = coursesByGrade[selectedGrade];
      
      // Crear inscripciones para todas las asignaturas del grado
      for (const courseSchoolYear of coursesForGrade) {
        const courseInscription = courseInscriptionRepository.create({
          inscriptionId: savedInscription.id,
          courseSchoolYearId: courseSchoolYear.id
        });
        
        await courseInscriptionRepository.save(courseInscription);
        console.log(`  - Inscripción en asignatura ${courseSchoolYear.course?.name || 'Desconocida'}.`);
      }
    } catch (error) {
      console.error(`Error al crear inscripción para el estudiante ${studentId}:`, error);
    }
  }

  console.log(`Seed de inscripciones completado. Se crearon ${createdInscriptions.length} inscripciones.`);
}; 