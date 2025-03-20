import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from '../people/people.module';
import { Representative } from './entities/representative.entity';
import { RepresentativeController } from './representative.controller';
import { RepresentanteService } from './representative.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Representative]),
    forwardRef(() => PersonasModule),
  ],
  controllers: [RepresentativeController],
  providers: [RepresentanteService],
  exports: [RepresentanteService],
})
export class RepresentanteModule {}
