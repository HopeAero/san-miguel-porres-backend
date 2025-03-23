import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolarYear } from './entities/schoolar-year.entity';
import { SchoolarYearService } from './schoolar-year.service';
import { SchoolarYearController } from './schoolar-year.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolarYear])],
  controllers: [SchoolarYearController],
  providers: [SchoolarYearService],
})
export class SchoolarYearModule {}