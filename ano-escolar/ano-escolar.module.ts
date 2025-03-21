import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnoEscolar } from './entities/ano-escolar.entity';
import { AnoEscolarService } from './ano-escolar.service';
import { AnoEscolarController } from './ano-escolar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AnoEscolar])], // Register the AnoEscolar entity
  controllers: [AnoEscolarController], // Register the controller
  providers: [AnoEscolarService], // Register the service
})
export class AnoEscolarModule {}