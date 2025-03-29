import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolarYear } from './entities/schoolar-year.entity';
import { CreateSchoolarYearDto } from './dto/create-schoolar-year.dto';
import { UpdateSchoolarYearDto } from './dto/update-schoolar-year.dto';
import { PageOptionsDto } from '../../common/dto/page.option.dto';
import { PageDto } from '../../common/dto/page.dto';

@Injectable()
export class SchoolarYearService {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
  ) {}

  async create(createSchoolarYearDto: CreateSchoolarYearDto): Promise<SchoolarYear> {
    const schoolarYear = this.schoolarYearRepository.create(createSchoolarYearDto);
    return this.schoolarYearRepository.save(schoolarYear);
  }

  async update(id: number, updateSchoolarYearDto: UpdateSchoolarYearDto): Promise<SchoolarYear> {
    const schoolarYear = await this.schoolarYearRepository.preload({
      id,
      ...updateSchoolarYearDto,
    });
    if (!schoolarYear) {
      throw new NotFoundException(`SchoolarYear with ID ${id} not found`);
    }
    return this.schoolarYearRepository.save(schoolarYear);
  }

  async findOne(id: number): Promise<SchoolarYear> {
    const schoolarYear = await this.schoolarYearRepository.findOne({ where: { id } });
    if (!schoolarYear) {
      throw new NotFoundException(`SchoolarYear with ID ${id} not found`);
    }
    return schoolarYear;
  }

  async paginate(pageOptionsDto: PageOptionsDto): Promise<PageDto<SchoolarYear>> {
    const [result, total] = await this.schoolarYearRepository.findAndCount({
      order: { id: pageOptionsDto.order },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
    });

    return new PageDto(result, total, pageOptionsDto);
  }

  async remove(id: number): Promise<void> {
    const result = await this.schoolarYearRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SchoolarYear with ID ${id} not found`);
    }
  }
}