import { DataSource } from 'typeorm';
import { Person } from '@/core/people/people/entities/person.entity';
import { Student } from '@/core/people/student/entities/student.entity';
import { Representative } from '@/core/people/representative/entities/representative.entity';
import { fakerES_MX as faker } from '@faker-js/faker';

export const runStudentSeed = async (dataSource: DataSource): Promise<void> => {
  // Obtener los repositorios necesarios
  const personRepository = dataSource.getRepository(Person);
  const studentRepository = dataSource.getRepository(Student);
  const representativeRepository = dataSource.getRepository(Representative);

  // Obtener todos los representantes creados
  const representatives = await representativeRepository.find({
    relations: ['person'],
  });

  if (representatives.length === 0) {
    console.log(
      'No hay representantes para asignar a los estudiantes. Por favor, ejecute primero el seed de representantes.',
    );
    return;
  }

  console.log(
    `Se encontraron ${representatives.length} representantes disponibles para asignar.`,
  );

  // Número de estudiantes a generar (al menos 50)
  const numberOfStudents = 50;

  // Array para almacenar los estudiantes creados
  const createdStudents: Student[] = [];

  // Generar estudiantes con datos aleatorios
  for (let i = 0; i < numberOfStudents; i++) {
    // Generar un DNI único para estudiante
    const dni = `E${faker.string.numeric(8)}`;

    // Verificar si ya existe un estudiante con ese DNI
    const existingPerson = await personRepository.findOne({
      where: { dni },
    });

    if (!existingPerson) {
      // Asignar un representante aleatorio
      const representative =
        representatives[Math.floor(Math.random() * representatives.length)];

      // Crear datos de persona (estudiante)
      const personData = {
        dni,
        name: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: `04${faker.string.numeric(9)}`,
        direction: faker.location.streetAddress({ useFullAddress: true }),
        // Fechas de nacimiento para niños en edad escolar (entre 6 y 18 años)
        birthDate: faker.date.between({
          from: new Date(new Date().getFullYear() - 18, 0, 1),
          to: new Date(new Date().getFullYear() - 6, 11, 31),
        }),
      };

      // 1. Crear la persona
      const person = personRepository.create(personData);
      const savedPerson = await personRepository.save(person);

      // 2. Crear el estudiante
      const student = studentRepository.create({
        id: savedPerson.id,
        person: savedPerson,
        representative: representative,
      });

      const savedStudent = await studentRepository.save(student);
      createdStudents.push(savedStudent);

      console.log(
        `Estudiante ${personData.name} ${personData.lastName} creado exitosamente con el representante ${representative.person.name} ${representative.person.lastName}`,
      );
    } else {
      console.log(`El estudiante con DNI ${dni} ya existe, generando otro...`);
      // Restar 1 al contador para asegurar que se generen suficientes estudiantes
      i--;
    }
  }

  console.log(
    `Seed de estudiantes completado. Se crearon ${createdStudents.length} estudiantes.`,
  );
};
