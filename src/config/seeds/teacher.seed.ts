import { DataSource } from 'typeorm';
import { Person } from '@/core/people/people/entities/person.entity';
import {
  Employee,
  TypeEmployee,
} from '@/core/people/employee/entities/employee.entity';

export const runTeacherSeed = async (dataSource: DataSource): Promise<void> => {
  // Obtener los repositorios necesarios
  const personRepository = dataSource.getRepository(Person);
  const employeeRepository = dataSource.getRepository(Employee);

  // Datos de profesores para el seed
  const teachersData = [
    {
      dni: '12345678',
      name: 'María',
      lastName: 'González',
      phone: '04241234567',
      direction: 'Av. Principal #123, Caracas',
      birthDate: new Date('1985-05-15'),
    },
    {
      dni: '23456789',
      name: 'José',
      lastName: 'Rodríguez',
      phone: '04167654321',
      direction: 'Calle Los Samanes #45, Maracaibo',
      birthDate: new Date('1980-08-23'),
    },
    {
      dni: '34567890',
      name: 'Ana',
      lastName: 'Martínez',
      phone: '04248765432',
      direction: 'Urbanización El Valle, Valencia',
      birthDate: new Date('1990-02-10'),
    },
    {
      dni: '45678901',
      name: 'Luis',
      lastName: 'Pérez',
      phone: '04149876543',
      direction: 'Sector La Floresta, Mérida',
      birthDate: new Date('1983-11-27'),
    },
    {
      dni: '56789012',
      name: 'Carmen',
      lastName: 'Díaz',
      phone: '04248901234',
      direction: 'Av. Libertador #78, Barquisimeto',
      birthDate: new Date('1988-07-19'),
    },
  ];

  // Crear profesores
  for (const teacherData of teachersData) {
    // Verificar si ya existe un profesor con ese DNI
    const existingPerson = await personRepository.findOne({
      where: { dni: teacherData.dni },
    });

    if (!existingPerson) {
      // 1. Crear la persona
      const person = personRepository.create(teacherData);
      const savedPerson = await personRepository.save(person);

      // 2. Crear el empleado de tipo profesor
      const employee = employeeRepository.create({
        id: savedPerson.id,
        employeeType: TypeEmployee.Professor,
        person: savedPerson,
      });

      await employeeRepository.save(employee);
      console.log(
        `Profesor ${teacherData.name} ${teacherData.lastName} creado exitosamente`,
      );
    } else {
      console.log(`El profesor con DNI ${teacherData.dni} ya existe`);
    }
  }

  console.log('Seed de profesores completado');
};
