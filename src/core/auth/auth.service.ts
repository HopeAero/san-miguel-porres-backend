import { Role } from '@/common/enum/role';
import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import { WrapperType } from '@/wrapper.type';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginCredentials } from './dto/login.dto';
import { RegistrationCredentials } from './dto/register.dto';
import { AuthUser } from './types/AuthUser';
import { AccessTokenPayload } from './types/AccessTokenPayload';
import {
  Employee,
  TypeEmployee,
} from '@/core/people/employee/entities/employee.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: WrapperType<UsersService>,
    private readonly jwtService: JwtService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const isMatch: boolean = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Contraseña incorrecta');
    }
    return user;
  }

  async generateToken(user: User): Promise<AuthUser> {
    const professors = await this.entityManager
      .createQueryBuilder(Employee, 'employee')
      .where('employee.userId = :userId', { userId: user.id })
      .andWhere('employee.employeeType = :type', {
        type: TypeEmployee.Professor,
      })
      .andWhere('employee.deletedAt IS NULL')
      .getMany();

    const payload: AccessTokenPayload = {
      email: user.email,
      userId: user.id,
      role: user.role,
      id: user.id,
      professors: professors.map((professor) => professor.id),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      name: user.name,
      email: user.email,
      role: user.role,
      professors: professors.map((professor) => professor.id),
    };
  }

  async login(login: LoginCredentials): Promise<AuthUser> {
    const user = await this.validateUser(login.email, login.password);
    return this.generateToken(user);
  }

  async register(user: RegistrationCredentials): Promise<AuthUser> {
    const existingUser = await this.usersService.findOneByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('El usuario ya existe');
    }
    const newUser = await this.usersService.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: Role.ADMIN,
    });

    return this.generateToken(newUser);
  }

  async me(email: string): Promise<AuthUser> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const professors = await this.entityManager
      .createQueryBuilder(Employee, 'employee')
      .where('employee.userId = :userId', { userId: user.id })
      .andWhere('employee.employeeType = :type', {
        type: TypeEmployee.Professor,
      })
      .andWhere('employee.deletedAt IS NULL')
      .getMany();

    return {
      accessToken: '',
      name: user.name,
      email: user.email,
      role: user.role,
      professors: professors.map((professor) => professor.id),
    };
  }
}
