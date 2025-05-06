import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(
      private configService: ConfigService,
      private userService: UserService,
   ) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      });
   }

   async validate(payload: any) {
      const user = await this.userService.findById(payload.sub);
      // Remove sensitive fields
      delete user.password;
      delete user.refreshToken;
      return user;
   }
}
