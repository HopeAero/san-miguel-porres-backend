import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PersonasController } from './people.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  controllers: [PersonasController],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}
