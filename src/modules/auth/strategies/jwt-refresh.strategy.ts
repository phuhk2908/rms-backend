import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
   Strategy,
   'jwt-refresh',
) {
   constructor(private configService: ConfigService) {
      super({
         jwtFromRequest: extractJWTFromCookie,
         ignoreExpiration: false,
         secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
         passReqToCallback: true,
      });
   }

   async validate(req: Request, payload: any) {
      const refreshToken = req.cookies.refresh_token;
      return {
         ...payload,
         refreshToken,
      };
   }
}

// Helper function to extract JWT from cookie
function extractJWTFromCookie(req: Request) {
   if (req.cookies && req.cookies.refresh_token) {
      return req.cookies.refresh_token;
   }
   return null;
}
