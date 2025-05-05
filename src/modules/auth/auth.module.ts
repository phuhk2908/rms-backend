import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '@modules/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '@modules/user/user.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([User]),
      JwtModule.register({
         secret: process.env.JWT_SECRET,
         signOptions: { expiresIn: '8h' },
      }),
      UserModule,
   ],
   providers: [AuthService, LocalStrategy, JwtStrategy],
   controllers: [AuthController],
   exports: [AuthService],
})
export class AuthModule {}
