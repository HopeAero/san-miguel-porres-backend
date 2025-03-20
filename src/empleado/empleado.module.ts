import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { EmpleadoService } from './empleado.service';
import { EmpleadoController } from './empleado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado])], // Register the Empleado entity
  controllers: [EmpleadoController], // Register the controller
  providers: [EmpleadoService], // Register the service
})
export class EmpleadoModule {}