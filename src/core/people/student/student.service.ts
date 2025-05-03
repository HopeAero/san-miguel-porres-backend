import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { WrapperType } from '@/wrapper.type';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { PeopleService } from '../people/people.service';
import { StudentDto } from './dto/student';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Representative } from '../representative/entities/representative.entity';
import { PaginateStudentAction } from './actions';

function formatStudent(studentEntity: Student): StudentDto {
  return plainToClass(StudentDto, {
    ...studentEntity.person,
    id: studentEntity.id,
    personId: studentEntity.person?.id || null,
    representative: studentEntity.representative || null,
  });
}

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private estudianteRepository: Repository<Student>,
    @InjectRepository(Representative)
    private representativeRepository: Repository<Representative>,
    @Inject(forwardRef(() => PeopleService))
    private personasService: WrapperType<PeopleService>,
    private paginateStudentAction: PaginateStudentAction,
  ) {}

  @Transactional()
  async create(createStudentDto: CreateStudentDto): Promise<StudentDto> {
    // Verificar que el representante existe
    const representative = await this.representativeRepository.findOne({
      where: { id: createStudentDto.representativeId },
    });

    if (!representative) {
      throw new BadRequestException(
        `No se encontró el representante con ID ${createStudentDto.representativeId}`,
      );
    }

    // Crear la persona
    const person = await this.personasService.create(createStudentDto);

    // Crear el estudiante con la relación al representante
    const student = this.estudianteRepository.create({
      id: person.id,
      person: person,
      representative: representative,
    });

    const savedStudent = await this.estudianteRepository.save(student);
    return await this.findOne(savedStudent.id);
  }

  async update(
    id: number,
    updateEstudianteDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    // Verificar que el representante existe si se proporcionó un ID
    if (updateEstudianteDto.representativeId) {
      const representative = await this.representativeRepository.findOne({
        where: { id: updateEstudianteDto.representativeId },
      });

      if (!representative) {
        throw new BadRequestException(
          `No se encontró el representante con ID ${updateEstudianteDto.representativeId}`,
        );
      }

      // Actualizar la relación con el representante
      await this.estudianteRepository.update(
        { id },
        { representative: representative },
      );
    }

    // Actualizar los datos de la persona
    const estudiante = await this.personasService.update(
      id,
      updateEstudianteDto,
    );

    if (!estudiante) {
      throw new NotFoundException(
        `No se encontro el estudiante con el ID ${id}`,
      );
    }

    const student = await this.estudianteRepository.save(estudiante);
    return await this.findOne(student.id);
  }

  // Find a single Estudiante by ID
  async findOne(id: number): Promise<StudentDto> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: { person: true, representative: true },
    });

    if (!estudiante) {
      throw new NotFoundException(
        `No se encontro el estudiante con el ID ${id}`,
      );
    }

    return formatStudent(estudiante);
  }

  async findAll(): Promise<StudentDto[]> {
    const estudiantes = await this.estudianteRepository.find({
      relations: { person: true, representative: true },
    });

    return estudiantes.map((estudiante) => formatStudent(estudiante));
  }

  async findAllWithFilters(search?: string, limit?: number, ids?: string): Promise<StudentDto[]> {
    // Crear un queryBuilder para realizar la búsqueda con filtros
    const queryBuilder = this.estudianteRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('student.representative', 'representative')
      .leftJoinAndSelect('representative.person', 'representativePerson')
      .where('student.deletedAt IS NULL');

    // Aplicar filtro de búsqueda si existe
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(person.name ILIKE :search OR person.lastName ILIKE :search OR person.dni ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Aplicar filtro por IDs específicos si existe
    if (ids) {
      const idArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (idArray.length > 0) {
        queryBuilder.andWhere('student.id IN (:...ids)', { ids: idArray });
      }
    }

    // Aplicar límite si existe
    if (limit && !isNaN(Number(limit))) {
      queryBuilder.take(Number(limit));
    }

    // Ordenar por ID de forma ascendente por defecto
    queryBuilder.orderBy('student.id', 'ASC');

    // Ejecutar la consulta
    const students = await queryBuilder.getMany();

    // Transformar los estudiantes al formato DTO
    return students.map(student => formatStudent(student));
  }

  async paginate(paginationDto: PageOptionsDto): Promise<PageDto<StudentDto>> {
    // Delegar el paginado a la acción específica
    return this.paginateStudentAction.execute(paginationDto);
  }

  // Soft-delete an Estudiante
  async remove(id: number): Promise<number> {
    const result = await this.personasService.remove(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `No se encontro el estudiante con el ID ${id}`,
      ); // Throw error if not found
    }

    return result.affected;
  }
}
