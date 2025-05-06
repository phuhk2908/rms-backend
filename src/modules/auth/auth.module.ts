import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UserModule } from '@modules/user/user.module';

@Module({
   imports: [
      UserModule,
      PassportModule,
      JwtModule.registerAsync({
         imports: [ConfigModule],
         inject: [ConfigService],
         useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_ACCESS_SECRET'),
            signOptions: {
               expiresIn: '15m', // Short-lived access token
            },
         }),
      }),
   ],
   controllers: [AuthController],
   providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
   exports: [AuthService],
})
export class AuthModule {}
