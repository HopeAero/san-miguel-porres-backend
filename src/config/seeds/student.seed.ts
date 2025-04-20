import { DataSource } from 'typeorm';
import { Person } from '@/core/people/people/entities/person.entity';
import { Student } from '@/core/people/student/entities/student.entity';
import { Representative } from '@/core/people/representative/entities/representative.entity';

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

  // Datos de estudiantes para el seed
  const studentsData = [
    {
      dni: 'E12345678',
      name: 'Juan',
      lastName: 'Pérez',
      phone: '04121234567',
      direction: 'Urb. El Paraíso, Caracas',
      birthDate: new Date('2008-02-15'),
    },
    {
      dni: 'E23456789',
      name: 'María',
      lastName: 'García',
      phone: '04162345678',
      direction: 'Av. Principal, Maracaibo',
      birthDate: new Date('2009-05-22'),
    },
    {
      dni: 'E34567890',
      name: 'Carlos',
      lastName: 'López',
      phone: '04243456789',
      direction: 'Calle Real, Valencia',
      birthDate: new Date('2008-10-10'),
    },
    {
      dni: 'E45678901',
      name: 'Ana',
      lastName: 'Martínez',
      phone: '04144567890',
      direction: 'Urb. La Floresta, Barquisimeto',
      birthDate: new Date('2010-03-17'),
    },
    {
      dni: 'E56789012',
      name: 'Luis',
      lastName: 'Rodríguez',
      phone: '04245678901',
      direction: 'Sector 23 de Enero, Caracas',
      birthDate: new Date('2009-12-30'),
    },
    {
      dni: 'E67890123',
      name: 'Sofía',
      lastName: 'Hernández',
      phone: '04166789012',
      direction: 'Av. Libertador, Mérida',
      birthDate: new Date('2008-07-25'),
    },
    {
      dni: 'E78901234',
      name: 'Diego',
      lastName: 'Torres',
      phone: '04127890123',
      direction: 'Calle Bolívar, San Cristóbal',
      birthDate: new Date('2010-09-05'),
    },
    {
      dni: 'E89012345',
      name: 'Valentina',
      lastName: 'Castillo',
      phone: '04158901234',
      direction: 'Urb. Los Olivos, Maracay',
      birthDate: new Date('2011-01-12'),
    },
    {
      dni: 'E90123456',
      name: 'Sebastián',
      lastName: 'González',
      phone: '04269012345',
      direction: 'Av. Sucre, Ciudad Bolívar',
      birthDate: new Date('2008-04-20'),
    },
    {
      dni: 'E01234567',
      name: 'Isabella',
      lastName: 'Díaz',
      phone: '04140123456',
      direction: 'Calle Principal, Punto Fijo',
      birthDate: new Date('2010-06-28'),
    },
    {
      dni: 'E11223344',
      name: 'Mateo',
      lastName: 'Sánchez',
      phone: '04241122334',
      direction: 'Urb. El Valle, Caracas',
      birthDate: new Date('2009-11-15'),
    },
    {
      dni: 'E22334455',
      name: 'Camila',
      lastName: 'Ramírez',
      phone: '04162233445',
      direction: 'Sector San José, Valencia',
      birthDate: new Date('2010-08-07'),
    },
    {
      dni: 'E33445566',
      name: 'Daniel',
      lastName: 'Mendoza',
      phone: '04123344556',
      direction: 'Av. Las Américas, Mérida',
      birthDate: new Date('2011-05-19'),
    },
    {
      dni: 'E44556677',
      name: 'Valeria',
      lastName: 'Ríos',
      phone: '04264455667',
      direction: 'Calle La Marina, Maracaibo',
      birthDate: new Date('2008-09-02'),
    },
    {
      dni: 'E55667788',
      name: 'Santiago',
      lastName: 'Morales',
      phone: '04145566778',
      direction: 'Urb. Santa Rosa, Barquisimeto',
      birthDate: new Date('2009-03-25'),
    },
  ];

  // Crear estudiantes
  for (let i = 0; i < studentsData.length; i++) {
    const studentData = studentsData[i];

    // Asignar un representante (distribuir entre los representantes disponibles)
    const representativeIndex = i % representatives.length;
    const representative = representatives[representativeIndex];

    // Verificar si ya existe un estudiante con ese DNI
    const existingPerson = await personRepository.findOne({
      where: { dni: studentData.dni },
    });

    if (!existingPerson) {
      // 1. Crear la persona
      const person = personRepository.create(studentData);
      const savedPerson = await personRepository.save(person);

      // 2. Crear el estudiante
      const student = studentRepository.create({
        id: savedPerson.id,
        person: savedPerson,
        representative: representative,
      });

      await studentRepository.save(student);
      console.log(
        `Estudiante ${studentData.name} ${studentData.lastName} creado exitosamente con el representante ${representative.person.name} ${representative.person.lastName}`,
      );
    } else {
      console.log(`El estudiante con DNI ${studentData.dni} ya existe`);
    }
  }

  console.log('Seed de estudiantes completado');
};
