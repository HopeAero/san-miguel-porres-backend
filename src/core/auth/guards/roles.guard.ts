import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@/common/enum/role';
import { AccessControlService } from '../strategy/access-control-service';
import { ROLE_KEY } from '@/common/decorators/roles.decorator';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from '@/users/entities/user.entity';

export class TokenDto {
  id: number;
  role: Role;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    const { user } = request;

    if (!user) {
      return false;
    }

    const token = await this.entityManager
      .createQueryBuilder(User, 'user')
      .where('user.email = :email', { email: user.email })
      .getOne();

    if (!token) {
      return false;
    }

    for (const role of requiredRoles) {
      const result = this.accessControlService.isAuthorized({
        requiredRole: role,
        currentRole: token.role as Role,
      });

      if (result) {
        return true;
      }
    }

    return false;
  }
}
