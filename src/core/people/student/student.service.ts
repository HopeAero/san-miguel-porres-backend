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
import { PeopleService } from '../people/people.service';
import { StudentDto } from './dto/student';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

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
    @Inject(forwardRef(() => PeopleService))
    private personasService: WrapperType<PeopleService>,
  ) {}

  @Transactional()
  async create(createStudentDto: CreateStudentDto): Promise<StudentDto> {
    const person = await this.personasService.create(createStudentDto);
    const student = await this.estudianteRepository.create(person);
    const savedStudent = await this.estudianteRepository.save(student);
    return await this.findOne(savedStudent.id);
  }

  async update(
    id: number,
    updateEstudianteDto: UpdateStudentDto,
  ): Promise<StudentDto> {
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

    const resultDto = result.map((estudiante) => formatStudent(estudiante));

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
