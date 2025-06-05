import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'; // Import the key

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check for the @Public() decorator first
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Route is public, bypassing RolesGuard.');
      return true; // Allow access if @Public() is used, regardless of roles
    }

    // If not public, proceed with role checking
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug(
        'No specific roles required for this route (and not public). Access granted by RolesGuard.',
      );
      // This typically means the route is protected by JwtAuthGuard but doesn't need specific roles.
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      this.logger.warn(
        'User or user.role not found in request. RolesGuard cannot verify permissions. Access denied.',
      );
      throw new ForbiddenException(
        'User role not found in token or user data incomplete. Cannot verify permissions.',
      );
    }

    this.logger.debug(
      `Required roles: ${requiredRoles.join(', ')}. User role: ${user.role}`,
    );
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      this.logger.warn(
        `User ${user.email} (role: ${user.role}) does not have required roles: ${requiredRoles.join(', ')}. Access denied.`,
      );
      throw new ForbiddenException(
        `You do not have the right permission (role: ${requiredRoles.join(', ')}) to access this resource.`,
      );
    }

    this.logger.debug(
      `User ${user.email} (role: ${user.role}) has required role. Access granted by RolesGuard.`,
    );
    return true;
  }
}
