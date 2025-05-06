import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../modules/user/entities/user.entity';
import { RefreshToken } from '../../modules/auth/entities/refresh-token.entity';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
   private readonly logger = new Logger(AuthService.name);

   constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
      @InjectRepository(RefreshToken)
      private readonly refreshTokenRepository: Repository<RefreshToken>,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly configService: ConfigService,
   ) {}

   async validateUser(email: string, password: string): Promise<User | null> {
      this.logger.debug(`Validating user with email: ${email}`);
      const user = await this.userService.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
         this.logger.debug('User validated successfully');
         return user;
      }
      this.logger.warn('Invalid user credentials');
      return null;
   }

   async generateAccessToken(user: User): Promise<string> {
      this.logger.debug(`Generating access token for user: ${user.id}`);
      const payload = {
         email: user.email,
         sub: user.id,
         role: user.role,
      };
      return this.jwtService.sign(payload);
   }

   async generateRefreshToken(user: User, req: Request): Promise<string> {
      this.logger.debug(`Generating refresh token for user: ${user.id}`);
      const refreshTokenExpires = this.configService.get<string>(
         'REFRESH_TOKEN_EXPIRES_IN',
      );
      const expiresAt = new Date();
      expiresAt.setSeconds(
         expiresAt.getSeconds() + parseInt(refreshTokenExpires),
      );

      const token = await this.jwtService.sign(
         { sub: user.id },
         {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: refreshTokenExpires,
         },
      );

      await this.refreshTokenRepository.save({
         token,
         expiresAt,
         user,
         userAgent: req.headers['user-agent'] || '',
         ipAddress: req.ip,
      });

      this.logger.debug('Refresh token generated successfully');
      return token;
   }

   async login(user: User, req: Request) {
      this.logger.debug(`Logging in user: ${user.id}`);
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user, req);

      return {
         access_token: accessToken,
         refresh_token: refreshToken,
         user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
         },
      };
   }

   async register(registerDto: RegisterDto): Promise<User> {
      this.logger.debug(
         `Registering new user with email: ${registerDto.email}`,
      );
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = this.userRepository.create({
         ...registerDto,
         password: hashedPassword,
      });
      return this.userRepository.save(user);
   }

   async setCookies(
      user: User,
      req: Request,
      res: Response,
   ): Promise<{ accessToken: string }> {
      this.logger.debug(`Setting auth cookies for user: ${user.id}`);
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user, req);

      // Set HTTP-only cookies
      res.cookie('access_token', accessToken, {
         httpOnly: true,
         secure: this.configService.get<string>('NODE_ENV') === 'production',
         sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-site requests
      });

      res.cookie('refresh_token', refreshToken, {
         httpOnly: true,
         secure: this.configService.get<string>('NODE_ENV') === 'production',
         sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-site requests
      });

      this.logger.debug('Auth cookies set successfully');
      return { accessToken };
   }

   async clearCookies(res: Response): Promise<void> {
      this.logger.debug('Clearing auth cookies');
      res.clearCookie('access_token', {
         httpOnly: true,
         secure: this.configService.get<string>('NODE_ENV') === 'production',
         sameSite: 'lax',
      });
      res.clearCookie('refresh_token', {
         httpOnly: true,
         secure: this.configService.get<string>('NODE_ENV') === 'production',
         sameSite: 'lax',
      });
      this.logger.debug('Successfully cleared auth cookies');
   }

   async refreshAccessToken(
      refreshToken: string,
      res: Response,
   ): Promise<string> {
      this.logger.debug(
         `Refreshing access token with refresh token: ${refreshToken}`,
      );
      const token = await this.refreshTokenRepository.findOne({
         where: { token: refreshToken },
         relations: ['user'],
      });

      if (!token || token.isRevoked || new Date() > token.expiresAt) {
         this.logger.warn('Invalid refresh token');
         throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateAccessToken(token.user);

      res.cookie('access_token', accessToken, {
         httpOnly: true,
         secure: this.configService.get<string>('NODE_ENV') === 'production',
         sameSite: 'lax',
      });

      this.logger.debug('Access token refreshed successfully');
      return accessToken;
   }

   async logout(refreshToken: string): Promise<void> {
      this.logger.debug(`Finding refresh token to revoke: ${refreshToken}`);

      const token = await this.refreshTokenRepository.findOne({
         where: { token: refreshToken },
         relations: ['user'],
      });

      if (token) {
         this.logger.debug(`Revoking refresh token for user: ${token.user.id}`);
         token.isRevoked = true;
         await this.refreshTokenRepository.save(token);
         this.logger.debug('Successfully revoked refresh token');
      } else {
         this.logger.warn('No refresh token found to revoke');
      }
   }

   async revokeAllUserTokens(userId: string): Promise<void> {
      this.logger.debug(`Revoking all tokens for user: ${userId}`);
      const user = await this.userRepository.findOne({
         where: { id: userId },
      });

      if (user) {
         await this.refreshTokenRepository
            .createQueryBuilder()
            .update()
            .set({ isRevoked: true })
            .where('user = :user', { user })
            .execute();
         this.logger.debug('Successfully revoked all tokens');
      } else {
         this.logger.warn('No user found to revoke tokens');
      }
   }
}
