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
import { SchoolCourt } from './entities/school-court.entity';

@Injectable()
export class SchoolarYearService {
  constructor(
    @InjectRepository(SchoolarYear)
    private schoolarYearRepository: Repository<SchoolarYear>,
    @InjectRepository(Lapse)
    private lapseRepository: Repository<Lapse>,
    @InjectRepository(SchoolCourt)
    private schoolCourtRepository: Repository<SchoolCourt>,
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
        lapse.endDate > schoolarYear.endDate ||
        lapse.startDate > lapse.endDate ||
        lapse.endDate < lapse.startDate
      ) {
        throw new BadRequestException(
          `El lapso con fechas ${lapse.startDate} - ${lapse.endDate} está fuera del rango del año escolar.`,
        );
      }

      if (lapse.scholarCourt && lapse.scholarCourt.length > 0) {
        lapse.scholarCourt.forEach((court) => {
          if (
            court.startDate < lapse.startDate ||
            court.endDate > lapse.endDate ||
            court.endDate < court.startDate ||
            court.startDate > court.endDate ||
            court.startDate < schoolarYear.startDate ||
            court.endDate > schoolarYear.endDate
          ) {
            throw new BadRequestException(
              `El corte con fechas ${court.startDate} - ${court.endDate} está fuera del rango del lapso ${lapse.startDate} - ${lapse.endDate}.`,
            );
          }
        });
      }
    });

    const newSchoolarYear =
      await this.schoolarYearRepository.create(schoolarYear);

    await this.schoolarYearRepository.save(newSchoolarYear);

    // Crear y guardar lapsos de forma secuencial
    let lapseNumber = 1; // Inicializamos el número del lapso

    for (const lapse of lapses) {
      const newLapse = await this.lapseRepository.create({
        ...lapse,
        lapseNumber,
        schoolYear: newSchoolarYear,
      });
      const savedLapse = await this.lapseRepository.save(newLapse);
      lapseNumber++;

      if (lapse.scholarCourt && lapse.scholarCourt.length > 0) {
        let scholarCourtNumber = 1; // Inicializamos el número del corte

        for (const court of lapse.scholarCourt) {
          const newCourt = await this.schoolCourtRepository.create({
            ...court,
            courtNumber: scholarCourtNumber,
            lapse: savedLapse,
          });
          await this.schoolCourtRepository.save(newCourt);
          scholarCourtNumber++;
        }
      }
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
          // Actualizar el lapso
          await this.lapseRepository.update(existingLapse.id, {
            ...existingLapse,
            ...updatedLapse,
          });

          // Obtener los cortes existentes del lapso
          const existingCourts = await this.schoolCourtRepository.find({
            where: { lapse: { id: existingLapse.id } },
            order: { courtNumber: 'ASC' },
          });

          // Actualizar o eliminar cortes existentes
          await Promise.all(
            existingCourts.map(async (existingCourt) => {
              const updatedCourt = updatedLapse.scholarCourt?.find(
                (court) => court.courtNumber === existingCourt.courtNumber,
              );

              if (updatedCourt) {
                // Actualizar el corte existente
                await this.schoolCourtRepository.update(existingCourt.id, {
                  ...existingCourt,
                  ...updatedCourt,
                });
              } else {
                // Eliminar el corte si no está en el arreglo enviado
                await this.schoolCourtRepository.softDelete(existingCourt.id);
              }
            }),
          );

          // Crear nuevos cortes si hay más en el arreglo enviado
          const existingCourtNumbers = existingCourts.map(
            (court) => court.courtNumber,
          );
          const newCourts = updatedLapse.scholarCourt
            ?.filter(
              (court) => !existingCourtNumbers.includes(court.courtNumber),
            )
            .map((court) => {
              return this.schoolCourtRepository.create({
                ...court,
                lapse: existingLapse,
              });
            });

          if (newCourts && newCourts.length > 0) {
            await this.schoolCourtRepository.save(newCourts);
          }
        } else {
          // Eliminar el lapso si no está en el arreglo enviado
          await this.lapseRepository.softDelete(existingLapse.id);
        }
      }),
    );

    // Crear nuevos lapsos si hay más en el arreglo enviado
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
        const savedLapses = await this.lapseRepository.save(newLapses);

        // Crear cortes para los nuevos lapsos
        for (const lapse of savedLapses) {
          const newCourts = lapse.scholarCourts?.map((court) => {
            return this.schoolCourtRepository.create({
              ...court,
              lapse,
            });
          });

          if (newCourts && newCourts.length > 0) {
            await this.schoolCourtRepository.save(newCourts);
          }
        }
      }
    }

    return await this.findOne(id);
  }

  async findOne(id: number): Promise<SchoolarYear> {
    const schoolarYear = await this.schoolarYearRepository
      .createQueryBuilder('schoolarYear')
      .leftJoinAndSelect('schoolarYear.lapses', 'lapse')
      .leftJoinAndSelect('lapse.scholarCourts', 'court')
      .where('schoolarYear.id = :id', { id })
      .getOne();

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
    const existingSchoolarYear = await this.findOne(id);

    if (!existingSchoolarYear) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }

    const result = await this.schoolarYearRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `El año escolar con ID ${id} no fue encontrado`,
      );
    }

    await this.lapseRepository.softDelete({
      schoolYear: { id },
    });

    await this.schoolCourtRepository.softDelete({
      lapse: { schoolYear: { id } },
    });
  }
}
