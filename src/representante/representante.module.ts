import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Representante } from './entities/representante.entity';
import { RepresentanteService } from './representante.service';
import { RepresentanteController } from './representante.controller';
import { PersonasModule } from '@/personas/personas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Representante]),
    forwardRef(() => PersonasModule),
  ],
  controllers: [RepresentanteController],
  providers: [RepresentanteService],
})
export class RepresentanteModule {}
