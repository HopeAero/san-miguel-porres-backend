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
  // Obtener los repositorios necesarios
  const employeeRepository = dataSource.getRepository(Employee);
  const contractWorkerRepository = dataSource.getRepository(ContractWorker);
  const contractProfessorRepository =
    dataSource.getRepository(ContractProfessor);

  // Obtener todos los empleados que no tienen contratos
  const workersWithoutContract = await employeeRepository.find({
    where: {
      employeeType: TypeEmployee.Worker,
      contractWorker: null,
    },
    relations: ['person', 'contractWorker'],
  });

  const professorsWithoutContract = await employeeRepository.find({
    where: {
      employeeType: TypeEmployee.Professor,
      contractProfessor: null,
    },
    relations: ['person', 'contractProfessor'],
  });

  let createdWorkerContracts = 0;
  let createdProfessorContracts = 0;

  // Crear contratos para trabajadores
  for (const worker of workersWithoutContract) {
    if (!worker.contractWorker) {
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

      const workingHours = new Decimal(
        faker.helpers.arrayElement([40, 35, 30, 25, 20]),
      );
      const hoursWorked = new Decimal(faker.number.int({ min: 160, max: 200 }));
      const hourlyCost = new Decimal(faker.number.int({ min: 15, max: 50 }));
      const monthlySalary = new Decimal(
        faker.number.int({ min: 400000, max: 1200000 }),
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
        nightBonus: new Decimal(faker.number.int({ min: 0, max: 200000 })),
        transport: faker.datatype.boolean(),
        antique: new Decimal(faker.number.int({ min: 0, max: 300000 })),
        bonusAcademic: new Decimal(faker.number.int({ min: 0, max: 150000 })),
        nroOfChildren: faker.number.int({ min: 0, max: 5 }),
        bonusCompensatory: new Decimal(
          faker.number.int({ min: 0, max: 100000 }),
        ),
        bonusForChildren: new Decimal(
          faker.number.int({ min: 0, max: 200000 }),
        ),
        geography: new Decimal(faker.number.int({ min: 0, max: 100000 })),
        homeCareAssistance: new Decimal(
          faker.number.int({ min: 0, max: 150000 }),
        ),
        bonusDisability: new Decimal(faker.number.int({ min: 0, max: 100000 })),
        totalSalary: new Decimal(
          faker.number.int({ min: 500000, max: 1800000 }),
        ),
      };

      const contractWorker =
        contractWorkerRepository.create(contractWorkerData);
      await contractWorkerRepository.save(contractWorker);
      createdWorkerContracts++;

      console.log(
        `Contrato de trabajador creado para ${worker.person.name} ${worker.person.lastName} - ${position}`,
      );
    }
  }

  // Crear contratos para profesores
  for (const professor of professorsWithoutContract) {
    if (!professor.contractProfessor) {
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

      const workingHours = new Decimal(
        faker.helpers.arrayElement([36, 30, 24, 18, 12]),
      );
      const hoursWorked = new Decimal(faker.number.int({ min: 120, max: 180 }));
      const hourlyCost = new Decimal(faker.number.int({ min: 20, max: 80 }));
      const monthlySalary = new Decimal(
        faker.number.int({ min: 600000, max: 2000000 }),
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
        hierarchy: new Decimal(faker.number.int({ min: 0, max: 500000 })),
        transport: faker.datatype.boolean(),
        antique: new Decimal(faker.number.int({ min: 0, max: 400000 })),
        teachingExercise: new Decimal(
          faker.number.int({ min: 0, max: 300000 }),
        ),
        nroOfChildren: faker.number.int({ min: 0, max: 4 }),
        postgraduate: new Decimal(faker.number.int({ min: 0, max: 600000 })),
        bonusForChildren: new Decimal(
          faker.number.int({ min: 0, max: 250000 }),
        ),
        geography: new Decimal(faker.number.int({ min: 0, max: 150000 })),
        homeCareAssistance: new Decimal(
          faker.number.int({ min: 0, max: 200000 }),
        ),
        bonusDisability: new Decimal(faker.number.int({ min: 0, max: 150000 })),
        totalSalary: new Decimal(
          faker.number.int({ min: 800000, max: 3000000 }),
        ),
      };

      const contractProfessor = contractProfessorRepository.create(
        contractProfessorData,
      );
      await contractProfessorRepository.save(contractProfessor);
      createdProfessorContracts++;

      console.log(
        `Contrato de profesor creado para ${professor.person.name} ${professor.person.lastName} - ${position}`,
      );
    }
  }

  console.log(
    `Seed de contratos completado. Se crearon ${createdWorkerContracts} contratos de trabajadores y ${createdProfessorContracts} contratos de profesores.`,
  );
};
