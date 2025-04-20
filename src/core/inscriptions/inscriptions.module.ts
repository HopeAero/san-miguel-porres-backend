import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscriptionsService } from './inscriptions.service';
import { InscriptionsController } from './inscriptions.controller';
import { Inscription } from './entities/inscription.entity';
import { CourseInscription } from './entities/course-inscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inscription, CourseInscription])],
  controllers: [InscriptionsController],
  providers: [
    InscriptionsService,
    // Aquí se añadirán las acciones cuando se implementen
  ],
  exports: [InscriptionsService],
})
export class InscriptionsModule {}
