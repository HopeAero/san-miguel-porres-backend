import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractProfessor } from './entities/contract-profesor.entity';
import { ContractWorker } from './entities/contract-workers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContractProfessor, ContractWorker])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
