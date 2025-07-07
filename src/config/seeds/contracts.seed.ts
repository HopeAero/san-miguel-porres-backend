import { DataSource } from 'typeorm';
import { Employee } from '@/core/people/employee/entities/employee.entity';
import { TypeEmployee } from '@/common/enum/employee-type.enum';
import { ContractWorker } from '@/core/contracts/entities/contract-workers.entity';
import { ContractProfessor } from '@/core/contracts/entities/contract-profesor.entity';
import { fakerES_MX as faker } from '@faker-js/faker';
import Decimal from 'decimal.js';

export const runContractsSeed = async (
  dataSource: DataSource,
): Promise<void> => {
  console.log('🏗️  Iniciando seed de contratos...');

  // Obtener los repositorios necesarios
  const employeeRepository = dataSource.getRepository(Employee);
  const contractWorkerRepository = dataSource.getRepository(ContractWorker);
  const contractProfessorRepository =
    dataSource.getRepository(ContractProfessor);

  // Obtener todos los empleados que no tienen contratos con validación
  const workersWithoutContract = await employeeRepository
    .createQueryBuilder('employee')
    .leftJoinAndSelect('employee.person', 'person')
    .leftJoinAndSelect('employee.contractWorker', 'contractWorker')
    .where('employee.employeeType = :type', { type: TypeEmployee.Worker })
    .andWhere('contractWorker.uuid IS NULL')
    .andWhere('person.dni IS NOT NULL')
    .getMany();

  const professorsWithoutContract = await employeeRepository
    .createQueryBuilder('employee')
    .leftJoinAndSelect('employee.person', 'person')
    .leftJoinAndSelect('employee.contractProfessor', 'contractProfessor')
    .where('employee.employeeType = :type', { type: TypeEmployee.Professor })
    .andWhere('contractProfessor.uuid IS NULL')
    .andWhere('person.dni IS NOT NULL')
    .getMany();

  let createdWorkerContracts = 0;
  let createdProfessorContracts = 0;

  console.log(
    `📋 Encontrados ${workersWithoutContract.length} trabajadores sin contrato`,
  );
  console.log(
    `👨‍🏫 Encontrados ${professorsWithoutContract.length} profesores sin contrato`,
  );

  // Crear contratos para trabajadores
  for (const worker of workersWithoutContract) {
    // Validación adicional
    if (!worker.contractWorker && worker.person && worker.person.dni) {
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

      const qualification = faker.helpers.arrayElement([
        'Bachiller',
        'Técnico Superior',
        'Técnico Medio',
        'Universitario',
        'Postgrado',
      ]);

      const grade = faker.helpers.arrayElement([
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
        'VII',
        'VIII',
        'IX',
        'X',
      ]);

      const level = faker.helpers.arrayElement([
        'Nivel 1',
        'Nivel 2',
        'Nivel 3',
        'Nivel 4',
        'Nivel 5',
      ]);

      // Crear Decimales de forma segura
      const workingHours = new Decimal(
        faker.helpers.arrayElement([40, 35, 30, 25, 20]),
      );
      const hoursWorked = new Decimal(faker.number.int({ min: 160, max: 200 }));
      const hourlyCost = new Decimal(faker.number.int({ min: 15, max: 50 }));
      const monthlySalary = new Decimal(
        faker.number.float({ min: 800.0, max: 5500.0, fractionDigits: 2 }),
      );

      const contractWorkerData = {
        employee: worker,
        dni: worker.person.dni,
        position,
        qualification,
        grade,
        level,
        workingHours,
        hoursWorked,
        hourlyCost,
        yearsOfServiceAvec: faker.number.int({ min: 0, max: 15 }),
        yearsOfServiceExternal: faker.number.int({ min: 0, max: 10 }),
        yearsOfServiceOtherAvec: faker.number.int({ min: 0, max: 5 }),
        monthlySalary,
        nightBonus: new Decimal(
          faker.number.float({ min: 0, max: 120.5, fractionDigits: 2 }),
        ),
        transport: faker.datatype.boolean(),
        antique: new Decimal(
          faker.number.float({ min: 0, max: 180.25, fractionDigits: 2 }),
        ),
        bonusAcademic: new Decimal(
          faker.number.float({ min: 0, max: 95.75, fractionDigits: 2 }),
        ),
        nroOfChildren: faker.number.int({ min: 0, max: 5 }),
        bonusCompensatory: new Decimal(
          faker.number.float({ min: 0, max: 65.5, fractionDigits: 2 }),
        ),
        bonusForChildren: new Decimal(
          faker.number.float({ min: 0, max: 125.75, fractionDigits: 2 }),
        ),
        geography: new Decimal(
          faker.number.float({ min: 0, max: 85.25, fractionDigits: 2 }),
        ),
        homeCareAssistance: new Decimal(
          faker.number.float({ min: 0, max: 110.0, fractionDigits: 2 }),
        ),
        bonusDisability: new Decimal(
          faker.number.float({ min: 0, max: 75.5, fractionDigits: 2 }),
        ),
        totalSalary: new Decimal(
          faker.number.float({ min: 1200.0, max: 7500.0, fractionDigits: 2 }),
        ),
      };

      try {
        const contractWorker =
          contractWorkerRepository.create(contractWorkerData);
        await contractWorkerRepository.save(contractWorker);
        createdWorkerContracts++;

        console.log(
          `✅ Contrato de trabajador creado para ${worker.person.name} ${worker.person.lastName} - ${position}`,
        );
      } catch (error) {
        console.error(
          `❌ Error creando contrato para trabajador ${worker.person.name} ${worker.person.lastName}:`,
          error.message,
        );
      }
    }
  }

  // Crear contratos para profesores
  for (const professor of professorsWithoutContract) {
    // Validación adicional
    if (
      !professor.contractProfessor &&
      professor.person &&
      professor.person.dni
    ) {
      const position = faker.helpers.arrayElement([
        'Profesor de Aula',
        'Coordinador Académico',
        'Profesor de Educación Física',
        'Profesor de Arte',
        'Profesor de Música',
        'Profesor de Inglés',
        'Profesor de Informática',
        'Orientador',
        'Bibliotecario Docente',
      ]);

      const category = faker.helpers.arrayElement([
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
      ]);

      const level = faker.helpers.arrayElement([
        'Nivel A',
        'Nivel B',
        'Nivel C',
        'Nivel D',
      ]);

      // Crear Decimales de forma segura
      const workingHours = new Decimal(
        faker.helpers.arrayElement([36, 30, 24, 18, 12]),
      );
      const hoursWorked = new Decimal(faker.number.int({ min: 120, max: 180 }));
      const hourlyCost = new Decimal(faker.number.int({ min: 20, max: 80 }));
      const monthlySalary = new Decimal(
        faker.number.float({ min: 1200.0, max: 3200.0, fractionDigits: 2 }),
      );

      const contractProfessorData = {
        employee: professor,
        dni: professor.person.dni,
        position,
        category,
        level,
        workingHours,
        hoursWorked,
        hourlyCost,
        yearsOfService: faker.number.int({ min: 0, max: 25 }),
        monthlySalary,
        hierarchy: new Decimal(
          faker.number.float({ min: 0, max: 1200.0, fractionDigits: 2 }),
        ),
        transport: faker.datatype.boolean(),
        antique: new Decimal(
          faker.number.float({ min: 0, max: 1800.0, fractionDigits: 2 }),
        ),
        teachingExercise: new Decimal(
          faker.number.float({ min: 0, max: 1200.0, fractionDigits: 2 }),
        ),
        nroOfChildren: faker.number.int({ min: 0, max: 4 }),
        postgraduate: new Decimal(
          faker.number.float({ min: 0, max: 1200.0, fractionDigits: 2 }),
        ),
        bonusForChildren: new Decimal(
          faker.number.float({ min: 0, max: 1200.0, fractionDigits: 2 }),
        ),
        geography: new Decimal(
          faker.number.float({ min: 0, max: 1200.0, fractionDigits: 2 }),
        ),
        homeCareAssistance: new Decimal(
          faker.number.float({ min: 0, max: 1200.0, fractionDigits: 2 }),
        ),
        bonusDisability: new Decimal(
          faker.number.float({ min: 0, max: 1200.0, fractionDigits: 2 }),
        ),
        totalSalary: new Decimal(
          faker.number.float({ min: 1200.0, max: 7500.0, fractionDigits: 2 }),
        ),
      };

      try {
        const contractProfessor = contractProfessorRepository.create(
          contractProfessorData,
        );
        await contractProfessorRepository.save(contractProfessor);
        createdProfessorContracts++;

        console.log(
          `✅ Contrato de profesor creado para ${professor.person.name} ${professor.person.lastName} - ${position}`,
        );
      } catch (error) {
        console.error(
          `❌ Error creando contrato para profesor ${professor.person.name} ${professor.person.lastName}:`,
          error.message,
        );
      }
    }
  }

  console.log(
    `🎉 Seed de contratos completado. Se crearon ${createdWorkerContracts} contratos de trabajadores y ${createdProfessorContracts} contratos de profesores.`,
  );
};
