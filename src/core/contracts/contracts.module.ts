import { Module, forwardRef } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractProfessor } from './entities/contract-profesor.entity';
import { ContractWorker } from './entities/contract-workers.entity';
import { EmployeeModule } from '../people/employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractProfessor, ContractWorker]),
    forwardRef(() => EmployeeModule),
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
