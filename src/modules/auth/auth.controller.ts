import {
   Controller,
   Post,
   Body,
   UseGuards,
   Request,
   Res,
   HttpCode,
   Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
   private readonly logger = new Logger(AuthController.name);

   constructor(private readonly authService: AuthService) {}

   @Public()
   @UseGuards(LocalAuthGuard)
   @Post('login')
   async login(
      @Body() loginDto: LoginDto,
      @Request() req,
      @Res({ passthrough: true }) res: Response,
   ): Promise<{ user: any; accessToken: string }> {
      const { accessToken } = await this.authService.setCookies(
         req.user,
         req,
         res,
      );
      return {
         user: {
            id: req.user.id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            role: req.user.role,
         },
         accessToken, // Optional: Only for debugging, remove in production
      };
   }

   @Public()
   @Post('register')
   async register(
      @Body() registerDto: RegisterDto,
      @Request() req,
      @Res({ passthrough: true }) res: Response,
   ): Promise<{ user: any; accessToken: string }> {
      const user = await this.authService.register(registerDto);
      const { accessToken } = await this.authService.setCookies(user, req, res);
      return {
         user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
         },
         accessToken, // Optional: Only for debugging, remove in production
      };
   }

   @Public()
   @UseGuards(RefreshTokenGuard)
   @Post('refresh')
   async refresh(
      @Request() req,
      @Res({ passthrough: true }) res: Response,
   ): Promise<{ accessToken: string }> {
      const accessToken = await this.authService.refreshAccessToken(
         req.user.refreshToken,
         res,
      );
      return { accessToken }; // Optional: Only for debugging, remove in production
   }

   @UseGuards(JwtAuthGuard)
   @Post('logout')
   @HttpCode(204)
   async logout(
      @Request() req,
      @Res({ passthrough: true }) res: Response,
   ): Promise<void> {
      const refreshToken = req.cookies?.refresh_token;
      this.logger.debug(
         `Attempting to logout with refresh token: ${refreshToken}`,
      );
      if (refreshToken) {
         await this.authService.logout(refreshToken);
         this.logger.debug('Successfully logged out and revoked refresh token');
      } else {
         this.logger.warn('No refresh token found in cookies during logout');
      }
      await this.authService.clearCookies(res);
   }

   @UseGuards(JwtAuthGuard)
   @Post('logout/all')
   @HttpCode(204)
   async logoutAll(
      @Request() req,
      @Res({ passthrough: true }) res: Response,
   ): Promise<void> {
      this.logger.debug(
         `Attempting to revoke all tokens for user: ${req.user.sub}`,
      );
      await this.authService.clearCookies(res);
      await this.authService.revokeAllUserTokens(req.user.sub);
      this.logger.debug('Successfully revoked all tokens');
   }
}
