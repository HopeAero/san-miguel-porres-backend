import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { ROOT_USER_CONFIG } from './root-user.config';
import { Role } from '@/common/enum/role';

@Injectable()
export class RootUserInitService {
  private readonly logger = new Logger(RootUserInitService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async initializeRootUser(): Promise<void> {
    try {
      // Verificar si ya existe un usuario root
      const existingRootUser = await this.usersRepository.findOne({
        where: { role: Role.ADMIN },
      });

      if (existingRootUser) {
        this.logger.log('Usuario root ya existe, no se creará uno nuevo');
        return;
      }

      // Crear usuario root
      const hashedPassword = await bcrypt.hash(ROOT_USER_CONFIG.password, 10);

      const rootUser = this.usersRepository.create({
        name: ROOT_USER_CONFIG.name,
        email: ROOT_USER_CONFIG.email,
        password: hashedPassword,
        role: ROOT_USER_CONFIG.role,
      });

      await this.usersRepository.save(rootUser);

      this.logger.log('Usuario root creado exitosamente');
      this.logger.log(`Email: ${ROOT_USER_CONFIG.email}`);
      this.logger.log(`Contraseña: ${ROOT_USER_CONFIG.password}`);
      this.logger.warn(
        'IMPORTANTE: Cambia la contraseña del usuario root después del primer inicio de sesión',
      );
    } catch (error) {
      this.logger.error('Error al crear usuario root:', error);
      throw error;
    }
  }
}
