import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { WrapperType } from '@/wrapper.type';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreatePersonaDto } from '../personas/dto/create-persona.dto';
import { UpdatePersonaDto } from '../personas/dto/update-persona.dto';
import { PersonasService } from '../personas/personas.service';
import { StudentPersonDto } from './dto/StudentPerson.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private estudianteRepository: Repository<Student>,
    @Inject(forwardRef(() => PersonasService))
    private personasService: WrapperType<PersonasService>,
  ) {}

  @Transactional()
  async create(createStudentDto: CreatePersonaDto): Promise<Student> {
    const person = await this.personasService.create(createStudentDto);
    const student = await this.estudianteRepository.create(person);
    return this.estudianteRepository.save(student);
  }
  async update(
    id: number,
    updateEstudianteDto: UpdatePersonaDto,
  ): Promise<Student> {
    const estudiante = await this.estudianteRepository.preload({
      id,
      ...updateEstudianteDto,
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`);
    }

    return this.estudianteRepository.save(estudiante);
  }

  // Find a single Estudiante by ID
  async findOne(id: number): Promise<StudentPersonDto> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['persona', 'representante'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`);
    }

    const studentPersonDto = plainToClass(StudentPersonDto, {
      id: estudiante.id,
      representante: estudiante.representante,
      ...estudiante.persona,
    });

    return studentPersonDto;
  }

  async findPaginated(paginationDto: PageOptionsDto) {
    const [result, total] = await this.estudianteRepository.findAndCount({
      order: {
        id: paginationDto.order,
      },
      take: paginationDto.perPage,
      skip: paginationDto.skip,
      relations: ['persona', 'representante'],
    });

    const resultDto = result.map((estudiante) =>
      plainToClass(EstudiantePersonaDto, {
        id: estudiante.id,
        representante: estudiante.representante,
        ...estudiante.persona,
      }),
    );

    return new PageDto(resultDto, total, paginationDto);
  }

  // Soft-delete an Estudiante
  async remove(id: number): Promise<void> {
    const result = await this.personasService.remove(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Estudiante with ID ${id} not found`); // Throw error if not found
    }
  }
}
