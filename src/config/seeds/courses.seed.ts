import { DataSource } from 'typeorm';
import { Course } from '@/core/courses/entities/course.entity';

export const runCoursesSeed = async (dataSource: DataSource): Promise<void> => {
  // Obtener el repositorio de cursos
  const courseRepository = dataSource.getRepository(Course);

  // Verificar si ya existen cursos en la base de datos
  const existingCoursesCount = await courseRepository.count();
  if (existingCoursesCount > 0) {
    console.log(
      `Ya existen ${existingCoursesCount} materias en la base de datos.`,
    );
    return;
  }

  console.log('Iniciando seed de materias...');

  // Array para almacenar todos los cursos a crear
  const coursesToCreate: Partial<Course>[] = [];

  // Materias comunes para primaria (1ro a 6to grado)
  const primaryCoreSubjects = [
    'Castellano',
    'Ingles',
    'Matematicas',
    'Lectura',
    'Artes plasticas',
    'Deportes',
    'Historia',
  ];

  // Materias opcionales para primaria (se asignarán aleatoriamente)
  const primaryOptionalSubjects = [
    'Geografia',
    'Geometria',
    'Valores',
    'Ciencias Naturales',
    'Educacion para la Salud',
    'Tecnologia',
  ];

  // Materias comunes para bachillerato (1er a 5to año)
  const highSchoolCoreSubjects = [
    'Ingles',
    'Castellano',
    'Deportes',
    'Historia',
    'Biologia',
    'Fisica',
    'Quimica',
    'Contabilidad',
    'Calculo',
  ];

  // Materias opcionales para bachillerato (se asignarán aleatoriamente)
  const highSchoolOptionalSubjects = [
    'Informatica',
    'Filosofia',
    'Orientacion',
    'Dibujo Tecnico',
    'Estadistica',
    'Psicologia',
  ];

  // Función para asignar las materias opcionales a años o grados aleatorios
  const getRandomGrades = (
    min: number,
    max: number,
    count: number,
  ): number[] => {
    const grades: number[] = [];
    while (grades.length < count) {
      const grade = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!grades.includes(grade)) {
        grades.push(grade);
      }
    }
    return grades;
  };

  // Generar cursos para primaria (grados 1-6)
  for (let grade = 1; grade <= 6; grade++) {
    // Agregar materias core para cada grado
    for (const subject of primaryCoreSubjects) {
      coursesToCreate.push({
        name: `${subject} ${grade}° grado`,
        publicName: subject,
        grade: grade,
      });
    }
  }

  // Asignar materias opcionales a grados aleatorios de primaria
  for (const subject of primaryOptionalSubjects) {
    // Determinar cuántas veces aparece esta materia (1 o 2 veces)
    const occurrences = Math.random() > 0.5 ? 2 : 1;

    if (occurrences === 1) {
      // Si aparece solo una vez, asignar a un grado aleatorio
      const grade = Math.floor(Math.random() * 6) + 1;
      coursesToCreate.push({
        name: `${subject} ${grade}° grado`,
        publicName: subject,
        grade: grade,
      });
    } else {
      // Si aparece dos veces, asignar a dos grados diferentes y usar numeración romana
      const grades = getRandomGrades(1, 6, 2).sort((a, b) => a - b);
      coursesToCreate.push({
        name: `${subject} I`,
        publicName: `${subject} I`,
        grade: grades[0],
      });
      coursesToCreate.push({
        name: `${subject} II`,
        publicName: `${subject} II`,
        grade: grades[1],
      });
    }
  }

  // Generar cursos para bachillerato (grados 7-11, equivalentes a 1er-5to año)
  for (let grade = 7; grade <= 11; grade++) {
    const highSchoolYear = grade - 6; // Convertir grado a año de bachillerato (7 -> 1er año)

    // Agregar materias core para cada año
    for (const subject of highSchoolCoreSubjects) {
      coursesToCreate.push({
        name: `${subject} ${highSchoolYear}° año`,
        publicName: subject,
        grade: grade,
      });
    }
  }

  // Asignar materias opcionales a años aleatorios de bachillerato
  for (const subject of highSchoolOptionalSubjects) {
    // Determinar cuántas veces aparece esta materia (1 o 2 veces)
    const occurrences = Math.random() > 0.5 ? 2 : 1;

    if (occurrences === 1) {
      // Si aparece solo una vez, asignar a un año aleatorio
      const grade = Math.floor(Math.random() * 5) + 7; // 7-11
      coursesToCreate.push({
        name: `${subject} ${grade - 6}° año`,
        publicName: subject,
        grade: grade,
      });
    } else {
      // Si aparece dos veces, asignar a dos años diferentes y usar numeración romana
      const grades = getRandomGrades(7, 11, 2).sort((a, b) => a - b);
      coursesToCreate.push({
        name: `${subject} I`,
        publicName: `${subject} I`,
        grade: grades[0],
      });
      coursesToCreate.push({
        name: `${subject} II`,
        publicName: `${subject} II`,
        grade: grades[1],
      });
    }
  }

  // Guardar todos los cursos
  try {
    await courseRepository.save(coursesToCreate);
    console.log(`Se crearon exitosamente ${coursesToCreate.length} materias.`);
  } catch (error) {
    console.error('Error al crear las materias:', error);
  }
};
