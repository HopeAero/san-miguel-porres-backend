import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Representante } from './entities/representante.entity';
import { RepresentanteService } from './representante.service';
import { RepresentanteController } from './representante.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Representante])], // Register the Representante entity
  controllers: [RepresentanteController], // Register the controller
  providers: [RepresentanteService], // Register the service
})
export class RepresentanteModule {}