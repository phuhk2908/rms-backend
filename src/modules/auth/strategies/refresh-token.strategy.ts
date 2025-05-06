import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
   Strategy,
   'jwt-refresh',
) {
   constructor(private readonly configService: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromExtractors([
            (req: Request) => {
               return req?.cookies?.refresh_token;
            },
         ]),
         secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
         passReqToCallback: true,
      });
   }

   async validate(req: Request, payload: any) {
      const refreshToken = req.cookies?.refresh_token;
      return { ...payload, refreshToken };
   }
}
