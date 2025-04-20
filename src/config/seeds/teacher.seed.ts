import { DataSource } from 'typeorm';
import { Person } from '@/core/people/people/entities/person.entity';
import {
  Employee,
  TypeEmployee,
} from '@/core/people/employee/entities/employee.entity';
import { fakerES_MX as faker } from '@faker-js/faker';

export const runTeacherSeed = async (dataSource: DataSource): Promise<void> => {
  // Obtener los repositorios necesarios
  const personRepository = dataSource.getRepository(Person);
  const employeeRepository = dataSource.getRepository(Employee);

  // Número de profesores a generar (al menos 30)
  const numberOfTeachers = 30;

  // Array para almacenar los profesores creados
  const createdTeachers: Employee[] = [];

  // Generar profesores con datos aleatorios
  for (let i = 0; i < numberOfTeachers; i++) {
    // Generar un DNI único para profesor
    const dni = `P${faker.string.numeric(8)}`;

    // Verificar si ya existe un profesor con ese DNI
    const existingPerson = await personRepository.findOne({
      where: { dni },
    });

    if (!existingPerson) {
      // Crear datos de persona (profesor)
      const personData = {
        dni,
        name: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: `04${faker.string.numeric(9)}`,
        direction: faker.location.streetAddress({ useFullAddress: true }),
        // Fechas de nacimiento para adultos entre 25 y 65 años
        birthDate: faker.date.between({
          from: new Date(new Date().getFullYear() - 65, 0, 1),
          to: new Date(new Date().getFullYear() - 25, 11, 31),
        }),
      };

      // 1. Crear la persona
      const person = personRepository.create(personData);
      const savedPerson = await personRepository.save(person);

      // 2. Crear el profesor como empleado de tipo profesor
      const teacher = employeeRepository.create({
        id: savedPerson.id,
        person: savedPerson,
        employeeType: TypeEmployee.Professor,
      });

      const savedTeacher = await employeeRepository.save(teacher);
      createdTeachers.push(savedTeacher);

      // Generar especialidad y grado aleatorios (solo para mostrar en consola)
      const degree = faker.helpers.arrayElement([
        'Licenciado en Educación',
        'Profesor',
        'Licenciado en Matemáticas',
        'Licenciado en Física',
        'Licenciado en Historia',
        'Licenciado en Literatura',
        'Licenciado en Biología',
        'Licenciado en Química',
        'Licenciado en Educación Física',
        'Licenciado en Filosofía',
        'Licenciado en Ciencias Sociales',
        'Licenciado en Arte',
        'Licenciado en Música',
        'Licenciado en Educación Inicial',
      ]);

      const specialty = faker.helpers.arrayElement([
        'Matemáticas',
        'Física',
        'Química',
        'Biología',
        'Historia',
        'Literatura',
        'Geografía',
        'Educación Física',
        'Arte',
        'Música',
        'Inglés',
        'Filosofía',
        'Informática',
        'Ciencias Sociales',
      ]);

      console.log(
        `Profesor ${personData.name} ${personData.lastName} creado exitosamente - ${degree} en ${specialty}`,
      );
    } else {
      console.log(`El profesor con DNI ${dni} ya existe, generando otro...`);
      // Restar 1 al contador para asegurar que se generen suficientes profesores
      i--;
    }
  }

  console.log(
    `Seed de profesores completado. Se crearon ${createdTeachers.length} profesores.`,
  );
};
