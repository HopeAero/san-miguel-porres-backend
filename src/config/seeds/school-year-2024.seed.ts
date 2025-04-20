import { DataSource } from 'typeorm';
import { SchoolYear } from '@/core/school-year/entities/school-year.entity';
import { SchoolLapse } from '@/core/school-year/entities/school-lapse.entity';
import { SchoolCourt } from '@/core/school-year/entities/school-court.entity';

export const runSchoolYear2024Seed = async (
  dataSource: DataSource,
): Promise<void> => {
  // Obtener los repositorios necesarios
  const schoolYearRepository = dataSource.getRepository(SchoolYear);
  const schoolLapseRepository = dataSource.getRepository(SchoolLapse);
  const schoolCourtRepository = dataSource.getRepository(SchoolCourt);

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
      startDate: '2025-01-15',
      endDate: '2025-04-15',
    },
    {
      lapseNumber: 3,
      startDate: '2025-04-16',
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

  console.log('Seed del año escolar 2024 completado');
};

/**
 * Función auxiliar para crear los 3 cortes de cada lapso
 */
async function createCourtsForLapse(
  schoolCourtRepository: any,
  lapse: SchoolLapse,
): Promise<void> {
  // Calcular las fechas de los cortes dividiendo el lapso en 3 partes
  const startDate = new Date(lapse.startDate);
  const endDate = new Date(lapse.endDate);

  // Calcular la duración total en días
  const durationInDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Dividir la duración en 3 partes iguales (aproximadamente)
  const partDuration = Math.floor(durationInDays / 3);

  const courtsData = [
    {
      courtNumber: 1,
      startDate: formatDate(startDate),
      endDate: formatDate(addDays(startDate, partDuration)),
    },
    {
      courtNumber: 2,
      startDate: formatDate(addDays(startDate, partDuration + 1)),
      endDate: formatDate(addDays(startDate, 2 * partDuration)),
    },
    {
      courtNumber: 3,
      startDate: formatDate(addDays(startDate, 2 * partDuration + 1)),
      endDate: formatDate(endDate),
    },
  ];

  for (const courtData of courtsData) {
    const court = schoolCourtRepository.create({
      ...courtData,
      schoolLapse: lapse,
    });

    await schoolCourtRepository.save(court);
    console.log(
      `Corte ${court.courtNumber} del lapso ${lapse.lapseNumber} creado exitosamente`,
    );
  }
}

/**
 * Función para añadir días a una fecha
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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
