import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { WrapperType } from '@/wrapper.type';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { ILike, Repository, DataSource, In } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { PeopleService } from '../people/people.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { Representative } from './entities/representative.entity';
import { RepresentativeDto } from './dto/representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { SearchRepresentativeDto } from './dto/search-representative.dto';

function formatRepresentative(
  representativeEntity: Representative,
): RepresentativeDto {
  return plainToClass(RepresentativeDto, {
    ...representativeEntity.person,
    id: representativeEntity.id,
    students: representativeEntity.students || null,
    personId: representativeEntity.person?.id || null,
  });
}

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representative)
    private representativeRepository: Repository<Representative>,
    @Inject(forwardRef(() => PeopleService))
    private peopleService: WrapperType<PeopleService>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Transactional()
  async create(
    createRepresentanteDto: CreateRepresentativeDto,
  ): Promise<RepresentativeDto> {
    const person = await this.peopleService.create(createRepresentanteDto);
    const representative = this.representativeRepository.create({
      person,
    });
    const savedRepresentative =
      await this.representativeRepository.save(representative);
    return await this.findOne(savedRepresentative.id);
  }

  async update(
    id: number,
    updateRepresentanteDto: UpdateRepresentativeDto,
  ): Promise<RepresentativeDto> {
    const representante = await this.peopleService.update(
      id,
      updateRepresentanteDto,
    );

    if (!representante) {
      throw new NotFoundException(
        `No se encontro el representante con el ID ${id}`,
      );
    }
    const updatedRepresentative =
      await this.representativeRepository.save(representante);

    return await this.findOne(updatedRepresentative.id);
  }

  // Find a single Representante by ID
  async findOne(id: number): Promise<RepresentativeDto> {
    const representante = await this.representativeRepository.findOne({
      where: { id },
      relations: {
        person: true,
        students: true,
      },
    });

    if (!representante) {
      throw new NotFoundException(`Representante with ID ${id} not found`);
    }

    return formatRepresentative(representante);
  }

  async findByName(name: string): Promise<RepresentativeDto[]> {
    const representantes = await this.representativeRepository.find({
      where: [
        { person: { name: ILike(`%${name}%`) } },
        { person: { lastName: ILike(`%${name}%`) } },
      ],
      relations: {
        person: true,
        students: true,
      },
    });

    if (!representantes || representantes.length === 0) {
      throw new NotFoundException(
        `No se encontró ningún representante con el nombre o apellido ${name}`,
      );
    }

    return representantes.map((representante: Representative) => {
      return formatRepresentative(representante);
    });
  }

  async findByDocument(dni: string): Promise<RepresentativeDto> {
    const representante = await this.representativeRepository.findOne({
      where: {
        person: { dni: ILike(`%${dni}%`) },
      },
      relations: {
        person: true,
        students: true,
      },
    });

    if (!representante) {
      throw new NotFoundException(
        `No se encontró ningún representante con el documento ${dni}`,
      );
    }

    return formatRepresentative(representante);
  }

  /**
   * Encuentra todos los representantes con opciones de filtrado
   * @param searchDto Criterios de búsqueda opcionales (término de búsqueda, límite)
   * @returns Lista de representantes filtrada
   */
  async findAll(
    searchDto?: SearchRepresentativeDto,
  ): Promise<RepresentativeDto[]> {
    let result: RepresentativeDto[] = [];

    // Si no hay criterios de búsqueda, obtenemos todos los representantes
    if (
      !searchDto ||
      (!searchDto.searchTerm && !searchDto.limit && !searchDto.forceItemsIds)
    ) {
      const representantes = await this.representativeRepository.find({
        relations: {
          person: true,
          students: true,
        },
      });

      result = representantes.map((representante: Representative) =>
        formatRepresentative(representante),
      );
    } else {
      // Si hay criterios, construimos una consulta más compleja
      const query = this.representativeRepository
        .createQueryBuilder('representative')
        .leftJoinAndSelect('representative.person', 'person')
        .leftJoinAndSelect('representative.students', 'students')
        .where('representative.deletedAt IS NULL');

      // Aplicar filtro por término de búsqueda si se proporciona (nombre, apellido o cédula)
      if (searchDto.searchTerm && searchDto.searchTerm.trim()) {
        query.andWhere(
          '(person.name ILIKE :search OR person.lastName ILIKE :search OR person.dni ILIKE :search)',
          {
            search: `%${searchDto.searchTerm}%`,
          },
        );
      }

      // Ordenar por nombre y apellido
      query.orderBy('person.name', 'ASC').addOrderBy('person.lastName', 'ASC');

      // Aplicar límite si se proporciona
      if (searchDto.limit && searchDto.limit > 0) {
        query.take(searchDto.limit);
      }

      const representantes = await query.getMany();

      // Formatear resultados
      result = representantes.map((representante: Representative) =>
        formatRepresentative(representante),
      );
    }

    return this.getResultWithForceItemsIds(result, searchDto?.forceItemsIds);
  }

  /**
   * Añade elementos forzados por ID a los resultados existentes
   * @param result Resultados iniciales
   * @param forceItemsIds String con IDs de elementos forzados separados por coma
   * @returns Resultados con los elementos forzados añadidos
   */
  private async getResultWithForceItemsIds(
    result: RepresentativeDto[],
    forceItemsIds: string | null | undefined,
  ): Promise<RepresentativeDto[]> {
    // Si hay IDs forzados, buscarlos y añadirlos al resultado
    if (forceItemsIds && forceItemsIds.trim()) {
      // Separar los IDs y convertirlos a números
      const neededItemsIds = this.getNeededItemsIds(
        forceItemsIds,
        result.map((representative) => representative.id),
      );

      if (!neededItemsIds.length) return result;

      // Buscar los representantes por los IDs forzados, incluyendo eliminados
      const forcedRepresentatives = await this.representativeRepository.find({
        where: { id: In(neededItemsIds) },
        relations: {
          person: true,
          students: true,
        },
        withDeleted: true,
      });

      // Añadir los representantes forzados al resultado
      const additionalRepresentatives = forcedRepresentatives.map(
        (representative) => formatRepresentative(representative),
      );

      // Concatenar los resultados
      result = result.concat(additionalRepresentatives);
    }

    return result;
  }

  /**
   * Determina qué IDs necesitan ser buscados específicamente
   * @param forceItemsIdsInput String con IDs de elementos forzados separados por coma
   * @param currentRepresentativeIds IDs de representantes ya obtenidos
   * @returns Lista de IDs que necesitan ser buscados adicionalmente
   */
  private getNeededItemsIds(
    forceItemsIdsInput: string | null | undefined,
    currentRepresentativeIds: number[],
  ): number[] {
    if (!forceItemsIdsInput) return [];

    const forceItemsIds = forceItemsIdsInput
      .split(',')
      .map((id) => id.trim())
      .filter((id) => !isNaN(Number(id)))
      .map((id) => Number(id));

    return forceItemsIds.filter((id) => !currentRepresentativeIds.includes(id));
  }

  async paginate(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<RepresentativeDto>> {
    const [result, total] = await this.representativeRepository.findAndCount({
      order: {
        id: pageOptionsDto.order,
      },
      take: pageOptionsDto.perPage,
      skip: pageOptionsDto.skip,
      relations: { person: true, students: true },
    });

    const representatives: RepresentativeDto[] = result.map(
      (representativeEntity: Representative) => {
        return formatRepresentative(representativeEntity);
      },
    );

    return new PageDto(representatives, total, pageOptionsDto);
  }

  // Soft-delete a Representante
  async remove(id: number): Promise<void> {
    const result = await this.peopleService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `No se encontro el representante con el ID ${id}`,
      );
    }
  }

  // Search Representatives by term
  async searchRepresentatives(term: string): Promise<any[]> {
    const query = `
      SELECT TOP 10 * 
      FROM representatives
      WHERE name LIKE @term OR id_number LIKE @term
    `;
    const formattedTerm = `%${term}%`;
    return this.dataSource.query(query, [formattedTerm]);
  }
}
