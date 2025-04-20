import { DataSource } from 'typeorm';
import { Person } from '@/core/people/people/entities/person.entity';
import { Representative } from '@/core/people/representative/entities/representative.entity';
import { fakerES_MX as faker } from '@faker-js/faker';

export const runRepresentativeSeed = async (
  dataSource: DataSource,
): Promise<void> => {
  // Obtener los repositorios necesarios
  const personRepository = dataSource.getRepository(Person);
  const representativeRepository = dataSource.getRepository(Representative);

  // Número de representantes a generar (al menos 20)
  const numberOfRepresentatives = 20;

  // Array para almacenar los representantes creados
  const createdRepresentatives: Representative[] = [];

  // Generar representantes con datos aleatorios
  for (let i = 0; i < numberOfRepresentatives; i++) {
    // Generar un DNI único para representante
    const dni = `R${faker.string.numeric(8)}`;

    // Verificar si ya existe un representante con ese DNI
    const existingPerson = await personRepository.findOne({
      where: { dni },
    });

    if (!existingPerson) {
      // Crear datos de persona (representante)
      const personData = {
        dni,
        name: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: `04${faker.string.numeric(9)}`,
        direction: faker.location.streetAddress(),
        // Fechas de nacimiento para adultos entre 25 y 60 años
        birthDate: faker.date.between({
          from: new Date(new Date().getFullYear() - 60, 0, 1),
          to: new Date(new Date().getFullYear() - 25, 11, 31),
        }),
      };

      // 1. Crear la persona
      const person = personRepository.create(personData);
      const savedPerson = await personRepository.save(person);

      // 2. Crear el representante (solo con los campos que existen en la entidad)
      const representative = representativeRepository.create({
        id: savedPerson.id,
        person: savedPerson,
      });

      const savedRepresentative =
        await representativeRepository.save(representative);
      createdRepresentatives.push(savedRepresentative);

      console.log(
        `Representante ${personData.name} ${personData.lastName} creado exitosamente`,
      );
    } else {
      console.log(
        `El representante con DNI ${dni} ya existe, generando otro...`,
      );
      // Restar 1 al contador para asegurar que se generen suficientes representantes
      i--;
    }
  }

  console.log(
    `Seed de representantes completado. Se crearon ${createdRepresentatives.length} representantes.`,
  );
};
