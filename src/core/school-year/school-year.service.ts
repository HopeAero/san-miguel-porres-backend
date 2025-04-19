import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolYear } from './entities/school-year.entity';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { PageOptionsDto } from '../../common/dto/page.option.dto';
import { PageDto } from '../../common/dto/page.dto';
import { CreateCrudSchoolYearDto } from './dto/create-crud-school-year.dto';
import { Transactional } from 'typeorm-transactional';
import {
  CreateSchoolYearAction,
  FindSchoolYearAction,
  RemoveSchoolYearAction,
  UpdateSchoolYearAction,
} from './actions';

@Injectable()
export class SchoolYearService {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepository: Repository<SchoolYear>,
    private createSchoolYearAction: CreateSchoolYearAction,
    private findSchoolYearAction: FindSchoolYearAction,
    private updateSchoolYearAction: UpdateSchoolYearAction,
    private removeSchoolYearAction: RemoveSchoolYearAction,
  ) {}

  @Transactional()
  async create(
    createCrudSchoolYearDto: CreateCrudSchoolYearDto,
  ): Promise<SchoolYear> {
    return this.createSchoolYearAction.execute(createCrudSchoolYearDto);
  }

  async findAll(): Promise<SchoolYear[]> {
    return await this.schoolYearRepository.find({
      where: { deletedAt: null },
    });
  }

  async update(
    id: number,
    updateSchoolYearDto: UpdateSchoolYearDto,
  ): Promise<SchoolYear> {
    return this.updateSchoolYearAction.execute(id, updateSchoolYearDto);
  }

  async findOne(id: number): Promise<SchoolYear> {
    return this.findSchoolYearAction.execute(id);
  }

  async paginate(pageOptionsDto: PageOptionsDto): Promise<PageDto<SchoolYear>> {
    const [result, total] = await this.schoolYearRepository.findAndCount({
      order: { id: pageOptionsDto.order },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
      relations: ['schoolLapses', 'schoolLapses.schoolCourts'],
      where: { deletedAt: null },
    });

    return new PageDto(result, total, pageOptionsDto);
  }

  async remove(id: number): Promise<void> {
    return this.removeSchoolYearAction.execute(id);
  }
}
