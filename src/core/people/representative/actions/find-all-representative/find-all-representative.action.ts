import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Representative } from '../../entities/representative.entity';
import { RepresentativeDto } from '../../dto/representative.dto';
import { plainToClass } from 'class-transformer';
import { SearchRepresentativeDto } from '../../dto/search-representative.dto';

@Injectable()
export class FindAllRepresentativeAction {
  constructor(
    @InjectRepository(Representative)
    private representativeRepository: Repository<Representative>,
  ) {}

  /**
   * Encuentra todos los representantes con opciones de filtrado
   * @param searchDto Criterios de búsqueda opcionales (término de búsqueda, límite)
   * @returns Lista de representantes filtrada
   */
  async execute(
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
        this.formatRepresentative(representante),
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
        this.formatRepresentative(representante),
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
        (representative) => this.formatRepresentative(representative),
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