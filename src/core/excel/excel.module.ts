import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { ContractsModule } from '../contracts/contracts.module';
import {
  GenerateTeachersPayrollAction,
  GenerateTeachersReportAction,
  GenerateWorkersReportAction,
} from './actions';

@Module({
  imports: [ContractsModule],
  controllers: [ExcelController],
  providers: [
    ExcelService,
    GenerateTeachersReportAction,
    GenerateWorkersReportAction,
    GenerateTeachersPayrollAction,
  ],
  exports: [ExcelService],
})
export class ExcelModule {}
