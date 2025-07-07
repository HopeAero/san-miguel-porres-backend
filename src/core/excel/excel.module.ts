import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { ContractsModule } from '../contracts/contracts.module';
import {
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
  ],
  exports: [ExcelService],
})
export class ExcelModule {}
