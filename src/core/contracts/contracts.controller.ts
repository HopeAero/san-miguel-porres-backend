import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CreateContractWorkerDto } from './dto/create-contract-worker.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('profesor')
  createProfesor(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Post('worker')
  createWorker(@Body() createContractDto: CreateContractWorkerDto) {
    return this.contractsService.createWorker(createContractDto);
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':dni')
  findOne(@Param('dni') dni: string) {
    return this.contractsService.findOne(dni);
  }

  @Patch(':dni')
  update(
    @Param('dni') dni: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(dni, updateContractDto);
  }

  @Delete(':dni')
  remove(@Param('dni') dni: string) {
    return this.contractsService.remove(dni);
  }
}
