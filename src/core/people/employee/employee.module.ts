import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PeopleModule } from '../people/people.module';
import { Employee } from './entities/employee.entity';
import { FindAllEmployeeAction, PaginateEmployeeAction } from './actions';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    forwardRef(() => PeopleModule),
  ],
  controllers: [EmployeeController], // Register the controller
  providers: [
    EmployeeService,
    FindAllEmployeeAction,
    PaginateEmployeeAction
  ], // Register the service and actions
  exports: [EmployeeService],
})
export class EmployeeModule {}
