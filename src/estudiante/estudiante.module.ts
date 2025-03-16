import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante])], // Register the Estudiante entity
  controllers: [EstudianteController], // Register the controller
  providers: [EstudianteService], // Register the service
})
export class EstudianteModule {}