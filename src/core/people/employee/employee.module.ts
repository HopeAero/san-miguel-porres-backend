import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])], // Register the Empleado entity
  controllers: [EmployeeController], // Register the controller
  providers: [EmployeeService], // Register the service
})
export class EmployeeModule {}
