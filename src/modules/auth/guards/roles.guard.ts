import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@shared/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(private reflector: Reflector) {}

   canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<UserRole[]>(
         'roles',
         context.getHandler(),
      );
      if (!requiredRoles) {
         return true;
      }
      const { user } = context.switchToHttp().getRequest();
      return requiredRoles.some((role) => user.role === role);
   }
}
