import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Representative } from '../../entities/representative.entity';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { RepresentativeDto } from '../../dto/representative.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PaginateRepresentativeAction {
  constructor(
    @InjectRepository(Representative)
    private representativeRepository: Repository<Representative>,
  ) {}

  /**
   * Pagina la lista de representantes con opciones
   * @param pageOptionsDto Opciones de paginación
   * @returns Lista paginada de representantes
   */
  async execute(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<RepresentativeDto>> {
    // Si se proporcionó un searchTerm, utilizar queryBuilder para la búsqueda
    if (
      pageOptionsDto.searchTerm !== undefined &&
      pageOptionsDto.searchTerm !== null &&
      pageOptionsDto.searchTerm.trim() !== ''
    ) {
      return this.executeWithSearch(pageOptionsDto);
    }

    // Si no hay searchTerm, usar el método findAndCount estándar
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
        return this.formatRepresentative(representativeEntity);
      },
    );

    return new PageDto(representatives, total, pageOptionsDto);
  }

  /**
   * Ejecuta la paginación con búsqueda por término
   * @param pageOptionsDto Opciones de paginación con término de búsqueda
   * @returns Lista paginada y filtrada de representantes
   */
  private async executeWithSearch(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<RepresentativeDto>> {
    const queryBuilder = this.representativeRepository
      .createQueryBuilder('representative')
      .leftJoinAndSelect('representative.person', 'person')
      .leftJoinAndSelect('representative.students', 'students')
      .where('representative.deletedAt IS NULL');

    // Aplicar filtro de búsqueda por nombre, apellido o documento
    queryBuilder.andWhere(
      '(person.name ILIKE :searchTerm OR person.lastName ILIKE :searchTerm OR person.dni ILIKE :searchTerm)',
      { searchTerm: `%${pageOptionsDto.searchTerm.trim()}%` },
    );

    // Ordenar y paginar
    queryBuilder
      .orderBy('representative.id', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.perPage);

    // Ejecutar la consulta
    const [result, total] = await queryBuilder.getManyAndCount();

    // Formatear los resultados
    const representatives = result.map((representativeEntity) =>
      this.formatRepresentative(representativeEntity),
    );

    return new PageDto(representatives, total, pageOptionsDto);
  }

  /**
   * Formatea una entidad de representante a un DTO
   * @param representativeEntity La entidad de representante a formatear
   * @returns El DTO formateado
   */
  private formatRepresentative(
    representativeEntity: Representative,
  ): RepresentativeDto {
    return plainToClass(RepresentativeDto, {
      ...representativeEntity.person,
      id: representativeEntity.id,
      students: representativeEntity.students || null,
      personId: representativeEntity.person?.id || null,
    });
  }
} 