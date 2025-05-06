import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UserService } from '@modules/user/user.service';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class AuthService {
   constructor(
      private userService: UserService,
      private jwtService: JwtService,
      private configService: ConfigService,
   ) {}

   async register(registerDto: RegisterDto): Promise<User> {
      return this.userService.create(registerDto);
   }

   async login(loginDto: LoginDto) {
      const { email, password } = loginDto;

      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
         throw new UnauthorizedException('Invalid credentials');
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
         throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens
      const tokens = await this.getTokens(user.id, user.email, user.role);

      // Update refresh token in database
      await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

      return {
         user: this.excludePassword(user),
         accessToken: tokens.accessToken,
         // refreshToken is sent as an HTTP-only cookie in the controller
      };
   }

   async refreshTokens(userId: string, refreshToken: string) {
      // Validate refresh token
      const user = await this.userService.getUserIfRefreshTokenMatches(
         userId,
         refreshToken,
      );

      // Generate new tokens
      const tokens = await this.getTokens(user.id, user.email, user.role);

      // Update refresh token in database
      await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

      return {
         accessToken: tokens.accessToken,
         // refreshToken is sent as an HTTP-only cookie in the controller
      };
   }

   async logout(userId: string) {
      // Remove refresh token from database
      await this.userService.updateRefreshToken(userId, null);
      return { success: true };
   }

   async getTokens(userId: string, email: string, role: string) {
      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(
            {
               sub: userId,
               email,
               role,
            },
            {
               secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
               expiresIn: '15m',
            },
         ),
         this.jwtService.signAsync(
            {
               sub: userId,
               email,
               role,
            },
            {
               secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
               expiresIn: '7d',
            },
         ),
      ]);

      return {
         accessToken,
         refreshToken,
      };
   }

   private excludePassword(user: User) {
      const { password, refreshToken, ...result } = user;
      void password;
      void refreshToken;
      return result;
   }
}
