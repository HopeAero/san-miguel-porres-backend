import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { plainToClass } from 'class-transformer';
import { UserDTO } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { StatusError } from '@/common';
import { STATUS } from '@/common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new StatusError({
        message: `Email ya registrado`,
        statusCode: STATUS.BAD_REQUEST,
      });
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(user);
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map((user) => {
      delete user.password;
      return plainToClass(UserDTO, {
        ...user,
        id: user.id,
      });
    });
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: number) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new StatusError({
          message: `Email ya registrado`,
          statusCode: STATUS.BAD_REQUEST,
        });
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete updateUserDto.password;
    }

    const user = await this.usersRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new StatusError({
        message: `Usuario no encontrado`,
        statusCode: STATUS.NOT_FOUND,
      });
    }

    return this.usersRepository.save(user);
  }

  async paginate(paginationDto: PageOptionsDto): Promise<PageDto<UserDTO>> {
    const [result, total] = await this.usersRepository.findAndCount({
      order: {
        id: paginationDto.order,
      },
      take: paginationDto.perPage,
      skip: paginationDto.skip,
    });

    const resultDto = result.map((user) => {
      delete user.password;
      return plainToClass(UserDTO, {
        ...user,
        id: user.id,
      });
    });

    return new PageDto(resultDto, total, paginationDto);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return await this.usersRepository.softDelete(id);
  }
}
