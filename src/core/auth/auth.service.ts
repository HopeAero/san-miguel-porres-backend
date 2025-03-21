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
import * as bcrypt from 'bcryptjs';
import { LoginCredentials } from './dto/login.dto';
import { RegistrationCredentials } from './dto/register.dto';
import { AccessToken } from './types/AccessToken';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: WrapperType<UsersService>,
    private readonly jwtService: JwtService,
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

  async generateToken(user: User): Promise<AccessToken> {
    const payload = { email: user.email, id: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(login: LoginCredentials): Promise<AccessToken> {
    const user = await this.validateUser(login.email, login.password);
    return this.generateToken(user);
  }

  async register(user: RegistrationCredentials): Promise<AccessToken> {
    const existingUser = await this.usersService.findOneByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('El usuario ya existe');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await this.usersService.create({
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: Role.ADMIN,
    });

    return this.generateToken(newUser);
  }
}
