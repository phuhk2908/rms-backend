import { Controller, Post, Body, UseGuards, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import {
   LoginResponseDto,
   LogoutResponseDto,
   RefreshTokenResponseDto,
   UserProfileDto,
} from './dto/auth-response.dto';

import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
   ApiTags,
   ApiOperation,
   ApiResponse,
   ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
   constructor(
      private authService: AuthService,
      private userService: UserService,
   ) {}

   @Public()
   @Post('register')
   @ApiOperation({ summary: 'Register a new user' })
   @ApiResponse({
      status: 201,
      description: 'User successfully registered',
      type: UserProfileDto,
   })
   @ApiResponse({ status: 400, description: 'Bad request' })
   async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
   }

   @Public()
   @Post('login')
   @ApiOperation({ summary: 'Login user' })
   @ApiResponse({
      status: 200,
      description: 'User successfully logged in',
      type: LoginResponseDto,
   })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) response: Response,
   ) {
      const result = await this.authService.login(loginDto);
      await this.setRefreshTokenCookie(response, result.user.id);
      return result;
   }

   @UseGuards(JwtRefreshGuard)
   @Get('refresh')
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Refresh access token' })
   @ApiResponse({
      status: 200,
      description: 'Token successfully refreshed',
      type: RefreshTokenResponseDto,
   })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   async refreshTokens(
      @GetCurrentUser('sub') userId: string,
      @GetCurrentUser('refreshToken') refreshToken: string,
      @Res({ passthrough: true }) response: Response,
   ) {
      const tokens = await this.authService.refreshTokens(userId, refreshToken);
      await this.setRefreshTokenCookie(response, userId);
      return tokens;
   }

   @Post('logout')
   @UseGuards(JwtAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Logout user' })
   @ApiResponse({
      status: 200,
      description: 'User successfully logged out',
      type: LogoutResponseDto,
   })
   async logout(
      @GetCurrentUser('sub') userId: string,
      @Res({ passthrough: true }) response: Response,
   ) {
      await this.authService.logout(userId);
      response.clearCookie('refresh_token', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         path: '/',
      });
      return { success: true };
   }

   @UseGuards(JwtAuthGuard)
   @Get('profile')
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Get user profile' })
   @ApiResponse({
      status: 200,
      description: 'Returns the user profile',
      type: UserProfileDto,
   })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   getProfile(@GetCurrentUser() user: User) {
      return user;
   }

   private async setRefreshTokenCookie(response: Response, userId: string) {
      const user = await this.userService.findById(userId);
      const tokens = await this.authService.getTokens(
         userId,
         user.email,
         user.role,
      );
      response.cookie('refresh_token', tokens.refreshToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000,
         path: '/',
      });
   }
}
