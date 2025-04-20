import { Role } from '@/common/enum/role';
import { Injectable } from '@nestjs/common';

interface IsAuthorizedParams {
  currentRole: Role;
  requiredRole: Role;
}

@Injectable()
export class AccessControlService {
  private hierarchies: Array<Map<string, number>> = [];
  private priority: number = 1;

  constructor() {
    this.buildRoles([Role.TEACHER, Role.MODERATOR, Role.ADMIN]);
  }

  /**
   * El método buildRoles permite crear una jerarquía de roles entre un conjunto específico de roles.
   * Los roles deben especificarse desde el usuario menos privilegiado hasta el más privilegiado.
   *  @param  roles Matriz que contiene la lista de roles
   */

  private buildRoles(roles: Role[]) {
    const hierarchy: Map<string, number> = new Map();
    roles.forEach((role) => {
      hierarchy.set(role, this.priority);
      this.priority++;
    });
    this.hierarchies.push(hierarchy);
  }

  public isAuthorized({ currentRole, requiredRole }: IsAuthorizedParams) {
    for (const hierarchy of this.hierarchies) {
      const priority = hierarchy.get(currentRole);
      const requiredPriority = hierarchy.get(requiredRole);
      if (priority && requiredPriority && priority >= requiredPriority) {
        return true;
      }
    }
    return false;
  }
}
