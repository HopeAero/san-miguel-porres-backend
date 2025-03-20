import { Module } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { PersonasController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from './entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Persona])],
  controllers: [PersonasController],
  providers: [PersonasService],
  exports: [PersonasService],
})
export class PersonasModule {}
