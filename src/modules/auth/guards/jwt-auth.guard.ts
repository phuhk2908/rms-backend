import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core'; // Import Reflector
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'; // Import the key

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    // Inject Reflector
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check for the @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Route is public, bypassing JWT authentication.');
      return true; // Allow access if @Public() is used
    }

    // If not public, proceed with default JWT authentication
    this.logger.debug(
      'Route is not public, proceeding with JWT authentication.',
    );
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // Added context parameter
    // Check again if the route is public in case of an error during token processing for an optional auth route.
    // This might be redundant if canActivate already returned true for public routes,
    // but acts as a safeguard.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (err || !user) {
      if (isPublic) {
        this.logger.debug(
          'Public route, access granted even if token is invalid or missing.',
        );
        return null; // For public routes, if token is provided and invalid, don't block, just don't populate user.
        // Or return true, depending on desired behavior for optional auth. Here, no user = anonymous.
      }
      this.logger.warn(
        `JWT Authentication failed: ${info?.message || err?.message || 'No user object'}`,
      );
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'You are not authorized to access this resource.',
        )
      );
    }
    this.logger.debug(`JWT Authentication successful for user: ${user.email}`);
    return user;
  }
}
