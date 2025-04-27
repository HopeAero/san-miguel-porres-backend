import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleModule } from '../people/people.module';
import { Representative } from './entities/representative.entity';
import { RepresentativeController } from './representative.controller';
import { RepresentanteService } from './representative.service';
import { FindAllRepresentativeAction, PaginateRepresentativeAction } from './actions';

@Module({
  imports: [
    TypeOrmModule.forFeature([Representative]),
    forwardRef(() => PeopleModule),
  ],
  controllers: [RepresentativeController],
  providers: [
    RepresentanteService, 
    FindAllRepresentativeAction, 
    PaginateRepresentativeAction
  ],
  exports: [RepresentanteService],
})
export class RepresentanteModule {}
