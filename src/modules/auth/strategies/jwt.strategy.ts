import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'; // Logger already imported
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { StaffService } from 'src/modules/staff/staff.service';
import { JwtPayload } from '../auth.service';
import { Staff } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly staffService: StaffService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    this.logger.log('JwtStrategy initialized. JWT_SECRET loaded.');
    if (!configService.get<string>('JWT_SECRET')) {
      this.logger.error(
        'JWT_SECRET is not defined in config. JWT Strategy will not work.',
      );
      throw new Error(
        'JWT_SECRET is not defined. Please set it in your .env file.',
      );
    }
  }

  async validate(payload: JwtPayload): Promise<Omit<Staff, 'password'>> {
    this.logger.debug(
      `Validating JWT payload for user ID: ${payload.sub}, email: ${payload.email}`,
    );
    const user = await this.staffService.findOne(payload.sub); // findOne now returns Omit<Staff, 'password'> | null

    if (!user) {
      // findOne already returns null if not found or password-omitted user
      this.logger.warn(
        `User not found during JWT validation (ID: ${payload.sub}). Token invalid.`,
      );
      throw new UnauthorizedException('User not found or token invalid.');
    }
    // The role check is important as roles can change.
    const fullUser = await this.staffService.findOneByEmail(user.email); // Get full user for role check if findOne doesn't include it
    if (!fullUser || fullUser.role !== payload.role) {
      this.logger.warn(
        `User role mismatch during JWT validation (ID: ${payload.sub}). DB: ${fullUser?.role}, Token: ${payload.role}`,
      );
      throw new UnauthorizedException(
        'User role has changed or is invalid. Please log in again.',
      );
    }

    this.logger.debug(`JWT validation successful for user: ${user.email}`);
    return user; // user is already Omit<Staff, 'password'>
  }
}
