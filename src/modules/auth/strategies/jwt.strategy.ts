import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { StaffService } from '../../staff/staff.service';
import { Role, Staff } from '@prisma/client';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
  return (req && req.cookies) ? (req.cookies['access_token'] || null) : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly staffService: StaffService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: Role }): Promise<Omit<Staff, 'password'>> {
    const user = await this.staffService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid.');
    }
    return user;
  }
}