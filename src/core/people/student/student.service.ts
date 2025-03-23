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
import { CreatePersonDto } from '../people/dto/create-person.dto';
import { UpdatePersonDto } from '../people/dto/update-person.dto';
import { PeopleService } from '../people/people.service';
import { StudentDto } from './dto/student';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private estudianteRepository: Repository<Student>,
    @Inject(forwardRef(() => PeopleService))
    private personasService: WrapperType<PeopleService>,
  ) {}

  @Transactional()
  async create(createStudentDto: CreatePersonDto): Promise<Student> {
    const person = await this.personasService.create(createStudentDto);
    const student = this.estudianteRepository.create(person);
    return await this.estudianteRepository.save(student);
  }
  async update(
    id: number,
    updateEstudianteDto: UpdatePersonDto,
  ): Promise<Student> {
    const estudiante = await this.estudianteRepository.preload({
      id,
      ...updateEstudianteDto,
    });

    if (!estudiante) {
      throw new NotFoundException(
        `No se encontro el estudiante con el ID ${id}`,
      );
    }

    return this.estudianteRepository.save(estudiante);
  }

  // Find a single Estudiante by ID
  async findOne(id: number): Promise<StudentDto> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: {
        person: true,
        representative: true,
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        `No se encontro el estudiante con el ID ${id}`,
      );
    }

    const studentPersonDto = plainToClass(StudentDto, {
      ...estudiante.person,
      id: estudiante.id,
      representative: estudiante.representative,
    });

    return studentPersonDto;
  }

  async paginate(paginationDto: PageOptionsDto): Promise<PageDto<StudentDto>> {
    const [result, total] = await this.estudianteRepository.findAndCount({
      order: {
        id: paginationDto.order,
      },
      take: paginationDto.perPage,
      skip: paginationDto.skip,
      relations: {
        person: true,
        representative: true,
      },
    });

    const resultDto = result.map((estudiante) =>
      plainToClass(StudentDto, {
        ...estudiante.person,
        id: estudiante.id,
        representative: estudiante.representative,
      }),
    );

    return new PageDto(resultDto, total, paginationDto);
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
