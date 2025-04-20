import { DataSource } from 'typeorm';
import { SchoolYear } from '@/core/school-year/entities/school-year.entity';
import { SchoolLapse } from '@/core/school-year/entities/school-lapse.entity';
import { SchoolCourt } from '@/core/school-year/entities/school-court.entity';
import { Course } from '@/core/courses/entities/course.entity';
import { CourseSchoolYear } from '@/core/school-year/entities/course-school-year.entity';
import { Employee } from '@/core/people/employee/entities/employee.entity';
import { TypeEmployee } from '@/core/people/employee/entities/employee.entity';

export const runSchoolYear2024Seed = async (
  dataSource: DataSource,
): Promise<void> => {
  // Obtener los repositorios necesarios
  const schoolYearRepository = dataSource.getRepository(SchoolYear);
  const schoolLapseRepository = dataSource.getRepository(SchoolLapse);
  const schoolCourtRepository = dataSource.getRepository(SchoolCourt);
  const courseRepository = dataSource.getRepository(Course);
  const courseSchoolYearRepository = dataSource.getRepository(CourseSchoolYear);
  const employeeRepository = dataSource.getRepository(Employee);

  // Verificar si ya existe el año escolar 2024
  const existingSchoolYear = await schoolYearRepository.findOne({
    where: { code: '2024' },
  });

  if (existingSchoolYear) {
    console.log('El año escolar 2024 ya existe');
    return;
  }

  // Crear el año escolar 2024
  // Fechas: desde el 15 de septiembre de 2024 hasta el 15 de julio de 2025
  const schoolYear = schoolYearRepository.create({
    code: '2024',
    startDate: '2024-09-15',
    endDate: '2025-07-15',
  });

  const savedSchoolYear = await schoolYearRepository.save(schoolYear);
  console.log(`Año escolar ${schoolYear.code} creado exitosamente`);

  // Crear los 3 lapsos
  const lapsesData = [
    {
      lapseNumber: 1,
      startDate: '2024-09-15',
      endDate: '2024-12-15',
    },
    {
      lapseNumber: 2,
      startDate: '2024-12-16',
      endDate: '2025-03-31',
    },
    {
      lapseNumber: 3,
      startDate: '2025-04-01',
      endDate: '2025-07-15',
    },
  ];

  for (const lapseData of lapsesData) {
    const lapse = schoolLapseRepository.create({
      ...lapseData,
      schoolYear: savedSchoolYear,
    });

    const savedLapse = await schoolLapseRepository.save(lapse);
    console.log(`Lapso ${lapse.lapseNumber} creado exitosamente`);

    // Crear los 3 cortes para cada lapso
    await createCourtsForLapse(schoolCourtRepository, savedLapse);
  }

  // Obtener todos los cursos
  const allCourses = await courseRepository.find();

  // Obtener todos los profesores (empleados de tipo professor)
  const allProfessors = await employeeRepository.find({
    where: { employeeType: TypeEmployee.Professor },
  });

  if (allProfessors.length === 0) {
    console.log('No se encontraron profesores para asignar a los cursos');
    return;
  }

  console.log(
    `Se encontraron ${allProfessors.length} profesores para asignar a los cursos`,
  );

  // Crear CourseSchoolYear para cada curso, asignándoles profesores aleatorios
  const courseSchoolYearsToCreate = [];

  for (const course of allCourses) {
    // Asignar un profesor aleatorio
    const randomProfessorIndex = Math.floor(
      Math.random() * allProfessors.length,
    );
    const professor = allProfessors[randomProfessorIndex];

    // Generar horas semanales aleatorias (entre 2 y 6)
    const weeklyHours = Math.floor(Math.random() * 5) + 2;

    // Crear objeto con solo las propiedades necesarias
    courseSchoolYearsToCreate.push({
      grade: course.grade,
      weeklyHours: weeklyHours,
      professorId: professor.id,
      courseId: course.id,
      schoolYearId: savedSchoolYear.id,
    });
  }

  // Guardar todos los CourseSchoolYear
  for (const courseData of courseSchoolYearsToCreate) {
    const courseSchoolYear = courseSchoolYearRepository.create(courseData);
    await courseSchoolYearRepository.save(courseSchoolYear);
  }

  console.log(
    `Se crearon ${courseSchoolYearsToCreate.length} asignaciones de cursos para el año escolar 2024`,
  );
  console.log('Seed del año escolar 2024 completado');
};

/**
 * Función auxiliar para crear los 3 cortes de cada lapso
 * Garantiza que las fechas de los cortes estén dentro del rango del lapso
 */
async function createCourtsForLapse(
  schoolCourtRepository: any,
  lapse: SchoolLapse,
): Promise<void> {
  // Convertir las fechas de string a objetos Date
  const lapseStartDate = new Date(lapse.startDate);
  const lapseEndDate = new Date(lapse.endDate);

  // Asegurarnos de que las fechas están en el formato correcto
  console.log(
    `Lapso fechas: ${formatDate(lapseStartDate)} - ${formatDate(lapseEndDate)}`,
  );

  // Calcular la duración total en días del lapso
  const durationInDays = Math.floor(
    (lapseEndDate.getTime() - lapseStartDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Dividir la duración en 3 partes iguales
  const partDuration = Math.floor(durationInDays / 3);

  // Calcular las fechas de los cortes
  // Corte 1: desde el inicio del lapso hasta 1/3 del lapso
  const court1End = new Date(lapseStartDate);
  court1End.setDate(lapseStartDate.getDate() + partDuration);

  // Corte 2: desde el final del corte 1 + 1 día hasta 2/3 del lapso
  const court2Start = new Date(court1End);
  court2Start.setDate(court1End.getDate() + 1);

  const court2End = new Date(court2Start);
  court2End.setDate(court2Start.getDate() + partDuration - 1);

  // Corte 3: desde el final del corte 2 + 1 día hasta el final del lapso
  const court3Start = new Date(court2End);
  court3Start.setDate(court2End.getDate() + 1);

  // Verificar que court3Start no exceda a lapseEndDate
  if (court3Start > lapseEndDate) {
    court3Start.setTime(lapseEndDate.getTime());
  }

  // Datos de los 3 cortes
  const courtsData = [
    {
      courtNumber: 1,
      startDate: formatDate(lapseStartDate),
      endDate: formatDate(court1End),
    },
    {
      courtNumber: 2,
      startDate: formatDate(court2Start),
      endDate: formatDate(court2End),
    },
    {
      courtNumber: 3,
      startDate: formatDate(court3Start),
      endDate: formatDate(lapseEndDate),
    },
  ];

  // Validar que todas las fechas estén dentro del rango del lapso
  for (const courtData of courtsData) {
    const courtStartDate = new Date(courtData.startDate);
    const courtEndDate = new Date(courtData.endDate);

    // Validar que la fecha de inicio del corte no sea anterior a la fecha de inicio del lapso
    if (courtStartDate < lapseStartDate) {
      courtData.startDate = formatDate(lapseStartDate);
    }

    // Validar que la fecha de fin del corte no sea posterior a la fecha de fin del lapso
    if (courtEndDate > lapseEndDate) {
      courtData.endDate = formatDate(lapseEndDate);
    }

    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    if (new Date(courtData.startDate) > new Date(courtData.endDate)) {
      courtData.startDate = courtData.endDate;
    }

    // Crear el corte
    const court = schoolCourtRepository.create({
      ...courtData,
      schoolLapse: lapse,
    });

    await schoolCourtRepository.save(court);
    console.log(
      `Corte ${court.courtNumber} del lapso ${lapse.lapseNumber} creado exitosamente con fechas ${court.startDate} - ${court.endDate}`,
    );
  }
}

/**
 * Función para formatear una fecha como YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
