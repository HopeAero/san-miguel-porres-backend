import { DataSource } from 'typeorm';
import { Person } from '@/core/people/people/entities/person.entity';
import {
  Employee,
  TypeEmployee,
} from '@/core/people/employee/entities/employee.entity';
import { fakerES_MX as faker } from '@faker-js/faker';

export const runWorkersSeed = async (dataSource: DataSource): Promise<void> => {
  // Obtener los repositorios necesarios
  const personRepository = dataSource.getRepository(Person);
  const employeeRepository = dataSource.getRepository(Employee);

  // Número de trabajadores a generar
  const numberOfWorkers = 20;

  // Array para almacenar los trabajadores creados
  const createdWorkers: Employee[] = [];

  // Generar trabajadores con datos aleatorios
  for (let i = 0; i < numberOfWorkers; i++) {
    // Generar un DNI único para trabajador
    const dni = `W${faker.string.numeric(8)}`;

    // Verificar si ya existe una persona con ese DNI
    const existingPerson = await personRepository.findOne({
      where: { dni },
    });

    if (!existingPerson) {
      // Crear datos de persona (trabajador)
      const personData = {
        dni,
        name: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: `04${faker.string.numeric(9)}`,
        direction: faker.location.streetAddress({ useFullAddress: true }),
        // Fechas de nacimiento para adultos entre 20 y 65 años
        birthDate: faker.date.between({
          from: new Date(new Date().getFullYear() - 65, 0, 1),
          to: new Date(new Date().getFullYear() - 20, 11, 31),
        }),
      };

      // 1. Crear la persona
      const person = personRepository.create(personData);
      const savedPerson = await personRepository.save(person);

      // 2. Crear el trabajador como empleado de tipo worker
      const worker = employeeRepository.create({
        id: savedPerson.id,
        person: savedPerson,
        employeeType: TypeEmployee.Worker,
      });

      const savedWorker = await employeeRepository.save(worker);
      createdWorkers.push(savedWorker);

      // Generar posición laboral aleatoria (solo para mostrar en consola)
      const position = faker.helpers.arrayElement([
        'Conserje',
        'Vigilante',
        'Secretario/a',
        'Auxiliar Administrativo',
        'Bibliotecario/a',
        'Asistente de Laboratorio',
        'Cocinero/a',
        'Auxiliar de Cocina',
        'Chofer',
        'Técnico en Mantenimiento',
        'Jardinero',
        'Asistente de Dirección',
        'Recepcionista',
        'Auxiliar de Limpieza',
        'Coordinador Administrativo',
      ]);

      console.log(
        `Trabajador ${personData.name} ${personData.lastName} creado exitosamente - Posición: ${position}`,
      );
    } else {
      console.log(`El trabajador con DNI ${dni} ya existe, generando otro...`);
      // Restar 1 al contador para asegurar que se generen suficientes trabajadores
      i--;
    }
  }

  console.log(
    `Seed de trabajadores completado. Se crearon ${createdWorkers.length} trabajadores.`,
  );
};
