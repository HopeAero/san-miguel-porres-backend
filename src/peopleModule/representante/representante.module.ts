import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from '../personas/personas.module';
import { Representante } from './entities/representante.entity';
import { RepresentanteController } from './representante.controller';
import { RepresentanteService } from './representante.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Representante]),
    forwardRef(() => PersonasModule),
  ],
  controllers: [RepresentanteController],
  providers: [RepresentanteService],
  exports: [RepresentanteService],
})
export class RepresentanteModule {}
