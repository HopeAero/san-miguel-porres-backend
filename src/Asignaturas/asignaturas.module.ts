import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignatura } from './entities/asignatura.entity';
import { AsignaturasService } from './asignaturas.service';
import { AsignaturasController } from './asignaturas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Asignatura])], // Register the Asignatura entity
  controllers: [AsignaturasController], // Register the controller
  providers: [AsignaturasService], // Register the service
})
export class AsignaturasModule {}