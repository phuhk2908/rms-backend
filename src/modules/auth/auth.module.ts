import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/user/entities/user.entity';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity'; // Add this
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
   imports: [
      UserModule,
      PassportModule,
      TypeOrmModule.forFeature([User, RefreshToken]), // Add RefreshToken here
      JwtModule.registerAsync({
         imports: [ConfigModule],
         useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
               expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
            },
         }),
         inject: [ConfigService],
      }),
   ],
   providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
   controllers: [AuthController],
   exports: [AuthService],
})
export class AuthModule {}
