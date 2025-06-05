import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { StaffModule } from '../staff/staff.module';
import { PrismaModule } from 'src/prisma/prisma.module';
// No need to import Reflector here if guards are provided and instantiated by NestJS DI in their own scope.
// However, ensure guards are correctly provided and Reflector is available in the NestJS context.
// NestJS CoreModule provides Reflector globally, so it should be injectable.

@Module({
  imports: [
    PrismaModule,
    StaffModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  // JwtAuthGuard and RolesGuard are typically applied globally or per controller/route,
  // and Reflector is injected into them by Nest's DI system.
  // They don't need to be re-exported or re-provided here unless specific new instances are needed.
  providers: [
    AuthService,
    JwtStrategy /* JwtAuthGuard, RolesGuard are implicitly available if used with @UseGuards */,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
