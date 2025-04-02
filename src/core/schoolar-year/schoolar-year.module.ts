import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolarYear } from './entities/schoolar-year.entity';
import { SchoolarYearService } from './schoolar-year.service';
import { SchoolarYearController } from './schoolar-year.controller';
import { Lapse } from './entities/lapse.entity';
import { SchoolCourt } from './entities/school-court.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolarYear, Lapse, SchoolCourt])],
  controllers: [SchoolarYearController],
  providers: [SchoolarYearService],
  exports: [SchoolarYearService],
})
export class SchoolarYearModule {}
