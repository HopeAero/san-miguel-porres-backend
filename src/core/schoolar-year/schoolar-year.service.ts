import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { SchoolarYear } from './entities/schoolar-year.entity';
import { UpdateSchoolarYearDto } from './dto/update-schoolar-year.dto';
import { PageOptionsDto } from '../../common/dto/page.option.dto';
import { PageDto } from '../../common/dto/page.dto';
import { Lapse } from './entities/lapse.entity';
import { CreateCrudOfCrudSchoolarYearDto } from './dto/create-crud-of-crud.dto';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class SchoolarYearService {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
    @InjectRepository(Lapse)
    private lapseRepository: Repository<Lapse>,
  ) {}

  @Transactional()
  async create(
    createCrudOfCrudSchoolarDto: CreateCrudOfCrudSchoolarYearDto,
  ): Promise<SchoolarYear> {
    const { schoolarYear, lapses } = createCrudOfCrudSchoolarDto;

    const existingSchoolarYear = await this.schoolarYearRepository.findOne({
      where: {
        code: Equal(schoolarYear.code),
      },
    });

    if (existingSchoolarYear) {
      throw new NotFoundException(
        `El año escolar con el código ${schoolarYear.code} ya existe`,
      );
    }

    lapses.forEach((lapse) => {
      if (
        lapse.startDate < schoolarYear.startDate ||
        lapse.endDate > schoolarYear.endDate
      ) {
        throw new BadRequestException(
          `El lapso con fechas ${lapse.startDate} - ${lapse.endDate} está fuera del rango del año escolar.`,
        );
      }
    });

    const newSchoolarYear =
      await this.schoolarYearRepository.create(schoolarYear);

    await this.schoolarYearRepository.save(newSchoolarYear);

    // Crear y guardar lapsos de forma secuencial
    let lapseNumber = 1; // Inicializamos el número del lapso
    const newLapses = [];

    for (const lapse of lapses) {
      const newLapse = await this.lapseRepository.create({
        ...lapse,
        lapseNumber,
        schoolYear: newSchoolarYear,
      });
      const savedLapse = await this.lapseRepository.save(newLapse);
      newLapses.push(savedLapse);
      lapseNumber++;
    }

    return newSchoolarYear;
  }

  async findAll(): Promise<SchoolarYear[]> {
    return await this.schoolarYearRepository.find({
      where: { deletedAt: null },
    });
  }

  @Transactional()
  async update(
    id: number,
    updateSchoolarYearDto: UpdateSchoolarYearDto,
  ): Promise<SchoolarYear> {
    const existingSchoolarYear = await this.schoolarYearRepository.findOne({
      where: {
        id: Equal(id),
      },
    });

    if (!existingSchoolarYear) {
      throw new NotFoundException(
        `El año escolar con el ID ${id} no fue encontrado`,
      );
    }

    const { schoolarYear, lapses } = updateSchoolarYearDto;

    await this.schoolarYearRepository.update(id, {
      ...existingSchoolarYear,
      ...schoolarYear,
    });

    const existingLapses = await this.lapseRepository.find({
      where: {
        schoolYear: {
          id: Equal(id),
        },
      },
      order: {
        lapseNumber: 'ASC',
      },
    });

    await Promise.all(
      existingLapses.map(async (existingLapse) => {
        const updatedLapse = lapses.find(
          (lapse) => lapse.lapseNumber === existingLapse.lapseNumber,
        );
        if (updatedLapse) {
          await this.lapseRepository.update(existingLapse.id, {
            ...existingLapse,
            ...updatedLapse,
          });
        } else {
          await this.lapseRepository.softDelete(existingLapse.id);
        }
      }),
    );

    if (lapses.length > 0) {
      const existingLapseNumbers = existingLapses.map(
        (lapse) => lapse.lapseNumber,
      );
      const newLapses = lapses
        .filter((lapse) => !existingLapseNumbers.includes(lapse.lapseNumber))
        .map((lapse) => {
          return this.lapseRepository.create({
            ...lapse,
            schoolYear: existingSchoolarYear,
          });
        });

      if (newLapses.length > 0) {
        await this.lapseRepository.save(newLapses);
      }
    }

    return await this.findOne(id);
  }

  async findOne(id: number): Promise<SchoolarYear> {
    const schoolarYear = await this.schoolarYearRepository.findOne({
      where: { id },
      relations: {
        lapses: true,
      },
    });

    if (!schoolarYear) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }
    return schoolarYear;
  }

  async paginate(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SchoolarYear>> {
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
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }
  }
}
