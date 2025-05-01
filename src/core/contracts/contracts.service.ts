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

  async findOne(id: string) {
    const contract = await this.contractRepository.findOne({
      where: { id: Equal(id) },
      relations: {
        employee: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('No se se encontró el contrato');
    }
    return contract;
  }

  async update(id: number, updateContractDto: UpdateContractDto) {
    return `This action updates a #${id} contract`;
  }

  async remove(id: number) {
    return `This action removes a #${id} contract`;
  }
}
