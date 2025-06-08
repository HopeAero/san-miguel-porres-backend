import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}
  /**
   * Crea un nuevo contrato
   * @param createContractDto - Datos del contrato a crear
   * @returns El contrato creado
   */
  async create(createContractDto: CreateContractDto) {
    const contract = this.contractRepository.create(createContractDto);
    return await this.contractRepository.save(contract);
  }

  async findAll() {
    return await this.contractRepository.find({
      relations: {
        employee: true,
      },
    });
  }

  async findOne(uuid: string) {
    const contract = await this.contractRepository.findOne({
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
    this.contractRepository.merge(contract, updateContractDto);
    return await this.contractRepository.save(contract);
  }

  async remove(uuid: string) {
    const contract = await this.findOne(uuid);
    return await this.contractRepository.softDelete(contract.uuid);
  }
}
