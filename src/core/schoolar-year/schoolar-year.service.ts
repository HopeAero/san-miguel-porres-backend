import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolarYear } from './entities/schoolar-year.entity';
import { UpdateSchoolarYearDto } from './dto/update-schoolar-year.dto';
import { PageOptionsDto } from '../../common/dto/page.option.dto';
import { PageDto } from '../../common/dto/page.dto';
import { CreateCrudOfCrudSchoolarYearDto } from './dto/create-crud-of-crud.dto';
import { Transactional } from 'typeorm-transactional';
import {
  CreateSchoolarYearAction,
  FindSchoolarYearAction,
  RemoveSchoolarYearAction,
  UpdateSchoolarYearAction,
} from './actions';

@Injectable()
export class SchoolarYearService {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
    private createSchoolarYearAction: CreateSchoolarYearAction,
    private findSchoolarYearAction: FindSchoolarYearAction,
    private updateSchoolarYearAction: UpdateSchoolarYearAction,
    private removeSchoolarYearAction: RemoveSchoolarYearAction,
  ) {}

  @Transactional()
  async create(
    createCrudOfCrudSchoolarDto: CreateCrudOfCrudSchoolarYearDto,
  ): Promise<SchoolarYear> {
    return this.createSchoolarYearAction.execute(createCrudOfCrudSchoolarDto);
  }

  async findAll(): Promise<SchoolarYear[]> {
    return await this.schoolarYearRepository.find({
      where: { deletedAt: null },
    });
  }

  async update(
    id: number,
    updateSchoolarYearDto: UpdateSchoolarYearDto,
  ): Promise<SchoolarYear> {
    return this.updateSchoolarYearAction.execute(id, updateSchoolarYearDto);
  }

  async findOne(id: number): Promise<SchoolarYear> {
    return this.findSchoolarYearAction.execute(id);
  }

  async paginate(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SchoolarYear>> {
    const [result, total] = await this.schoolarYearRepository.findAndCount({
      order: { id: pageOptionsDto.order },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
      relations: ['lapses', 'lapses.scholarCourts'],
      where: { deletedAt: null },
    });

    return new PageDto(result, total, pageOptionsDto);
  }

  async remove(id: number): Promise<void> {
    return this.removeSchoolarYearAction.execute(id);
  }
}
