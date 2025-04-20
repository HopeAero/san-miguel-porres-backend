import { DataSource } from 'typeorm';
import { Person } from '@/core/people/people/entities/person.entity';
import { Representative } from '@/core/people/representative/entities/representative.entity';

export const runRepresentativeSeed = async (
  dataSource: DataSource,
): Promise<void> => {
  // Obtener los repositorios necesarios
  const personRepository = dataSource.getRepository(Person);
  const representativeRepository = dataSource.getRepository(Representative);

  // Datos de representantes para el seed
  const representativesData = [
    {
      dni: '87654321',
      name: 'Pedro',
      lastName: 'Ramírez',
      phone: '04161112233',
      direction: 'Urb. La Candelaria, Caracas',
      birthDate: new Date('1975-03-21'),
    },
    {
      dni: '76543210',
      name: 'Laura',
      lastName: 'Salazar',
      phone: '04269998877',
      direction: 'Av. Bolívar, Valencia',
      birthDate: new Date('1978-11-15'),
    },
    {
      dni: '65432109',
      name: 'Carlos',
      lastName: 'Mendoza',
      phone: '04145556677',
      direction: 'Calle Real, Maracay',
      birthDate: new Date('1980-07-30'),
    },
    {
      dni: '54321098',
      name: 'Patricia',
      lastName: 'Morales',
      phone: '04248889900',
      direction: 'Urb. Los Naranjos, Maracaibo',
      birthDate: new Date('1982-05-12'),
    },
    {
      dni: '43210987',
      name: 'Roberto',
      lastName: 'Suárez',
      phone: '04167778899',
      direction: 'Av. Las Mercedes, Barquisimeto',
      birthDate: new Date('1976-09-08'),
    },
    {
      dni: '32109876',
      name: 'Mónica',
      lastName: 'Torres',
      phone: '04149993322',
      direction: 'Calle San Juan, Puerto La Cruz',
      birthDate: new Date('1979-01-25'),
    },
    {
      dni: '21098765',
      name: 'Jorge',
      lastName: 'Vargas',
      phone: '04242221133',
      direction: 'Urb. El Cafetal, Caracas',
      birthDate: new Date('1977-06-17'),
    },
    {
      dni: '10987654',
      name: 'Daniela',
      lastName: 'Rincón',
      phone: '04168887766',
      direction: 'Res. Las Acacias, San Cristóbal',
      birthDate: new Date('1981-10-05'),
    },
    {
      dni: '09876543',
      name: 'Miguel',
      lastName: 'Castro',
      phone: '04144443322',
      direction: 'Calle Principal, Punto Fijo',
      birthDate: new Date('1974-12-18'),
    },
    {
      dni: '98765432',
      name: 'Susana',
      lastName: 'Blanco',
      phone: '04266665544',
      direction: 'Av. Miranda, Maturín',
      birthDate: new Date('1983-08-22'),
    },
  ];

  // Crear representantes
  for (const representativeData of representativesData) {
    // Verificar si ya existe un representante con ese DNI
    const existingPerson = await personRepository.findOne({
      where: { dni: representativeData.dni },
    });

    if (!existingPerson) {
      // 1. Crear la persona
      const person = personRepository.create(representativeData);
      const savedPerson = await personRepository.save(person);

      // 2. Crear el representante
      const representative = representativeRepository.create({
        id: savedPerson.id,
        person: savedPerson,
      });

      await representativeRepository.save(representative);
      console.log(
        `Representante ${representativeData.name} ${representativeData.lastName} creado exitosamente`,
      );
    } else {
      console.log(
        `El representante con DNI ${representativeData.dni} ya existe`,
      );
    }
  }

  console.log('Seed de representantes completado');
};
