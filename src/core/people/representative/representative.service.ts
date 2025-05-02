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
import { ILike, Repository, DataSource } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { PeopleService } from '../people/people.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { Representative } from './entities/representative.entity';
import { RepresentativeDto } from './dto/representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { SearchRepresentativeDto } from './dto/search-representative.dto';
import { FindAllRepresentativeAction, PaginateRepresentativeAction } from './actions';

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
    private findAllRepresentativeAction: FindAllRepresentativeAction,
    private paginateRepresentativeAction: PaginateRepresentativeAction,
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
    return this.findAllRepresentativeAction.execute(searchDto);
  }

  async paginate(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<RepresentativeDto>> {
    return this.paginateRepresentativeAction.execute(pageOptionsDto);
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
