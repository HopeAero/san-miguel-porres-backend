import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractProfessor } from './entities/contract-profesor.entity';
import { Equal, Repository } from 'typeorm';
import { ContractWorker } from './entities/contract-workers.entity';
import { EmployeeService } from '../people/employee/employee.service';
import { WrapperType } from '@/wrapper.type';
import { TypeEmployee } from '../people/employee/entities/employee.entity';
import { CreateContractWorkerDto } from './dto/create-contract-worker.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractProfessor)
    private readonly contractProfessorRepository: Repository<ContractProfessor>,
    @InjectRepository(ContractWorker)
    private readonly contractWorkerRepository: Repository<ContractWorker>,
    private readonly employeeService: WrapperType<EmployeeService>,
  ) {}
  /**
   * Crea un nuevo contrato
   * @param createContractDto - Datos del contrato a crear
   * @returns El contrato creado
   */
  async create(createContractDto: CreateContractDto) {
    const { dni, ...data } = createContractDto;

    const employee = await this.employeeService.findOneByDni(dni);

    if (!employee) {
      throw new NotFoundException('No se se encontró el empleado');
    }

    if (employee.employeeType !== TypeEmployee.Professor) {
      throw new BadRequestException('El empleado no es un profesor');
    }
    const contract = this.contractProfessorRepository.create({
      ...data,
      employee: employee,
    });
    return await this.contractProfessorRepository.save(contract);
  }

  async createWorker(createContractDto: CreateContractWorkerDto) {
    const { dni, ...data } = createContractDto;

    const employee = await this.employeeService.findOneByDni(dni);

    if (!employee) {
      throw new NotFoundException('No se se encontró el empleado');
    }

    if (employee.employeeType !== TypeEmployee.Worker) {
      throw new BadRequestException('El empleado no es un obrero');
    }

    const contract = this.contractWorkerRepository.create({
      ...data,
      employee: employee,
    });
    return await this.contractWorkerRepository.save(contract);
  }

  async findAll() {
    return await this.contractProfessorRepository.find({
      relations: {
        employee: true,
      },
    });
  }

  async findOne(uuid: string) {
    const contract = await this.contractProfessorRepository.findOne({
      where: { uuid: Equal(uuid) },
      relations: {
        employee: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('No se se encontró el contrato');
    }
    return contract;
  }

  async update(uuid: string, updateContractDto: UpdateContractDto) {
    const contract = await this.findOne(uuid);
    this.contractProfessorRepository.merge(contract, updateContractDto);
    return await this.contractProfessorRepository.save(contract);
  }

  async remove(uuid: string) {
    const contract = await this.findOne(uuid);
    return await this.contractProfessorRepository.softDelete(contract.uuid);
  }
}
