import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@shared/enums/user-role.enum';
import {
   IsUUID,
   IsEmail,
   IsString,
   IsEnum,
   IsOptional,
   IsDateString,
   IsBoolean,
} from 'class-validator';
export class UserProfileDto {
   @ApiProperty({
      description: 'The unique identifier of the user',
      example: '123e4567-e89b-12d3-a456-426614174000',
   })
   id: string;

   @IsEmail()
   @ApiProperty({
      description: 'The email address of the user',
      example: 'user@example.com',
   })
   email: string;

   @IsString()
   @ApiProperty({
      description: 'The first name of the user',
      example: 'John',
   })
   firstName: string;

   @IsString()
   @ApiProperty({
      description: 'The last name of the user',
      example: 'Doe',
   })
   lastName: string;

   @IsEnum(UserRole)
   @ApiProperty({
      description: 'The role of the user',
      enum: UserRole,
      example: UserRole.WAITER,
   })
   role: UserRole;

   @IsOptional()
   @IsString()
   @ApiProperty({
      description: 'The phone number of the user',
      example: '+1234567890',
      required: false,
   })
   phoneNumber?: string;

   @IsDateString()
   @ApiProperty({
      description: 'The date when the user was created',
      example: '2024-01-01T00:00:00.000Z',
   })
   createdAt: Date;

   @IsDateString()
   @ApiProperty({
      description: 'The date when the user was last updated',
      example: '2024-01-01T00:00:00.000Z',
   })
   updatedAt: Date;
}

export class LoginResponseDto {
   @IsUUID()
   @ApiProperty({
      description: 'The user profile information',
      type: UserProfileDto,
   })
   user: UserProfileDto;

   @IsString()
   @ApiProperty({
      description: 'The JWT access token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   })
   accessToken: string;
}

export class RefreshTokenResponseDto {
   @ApiProperty({
      description: 'The new JWT access token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   })
   @IsString()
   accessToken: string;
}

export class LogoutResponseDto {
   @ApiProperty({
      description: 'Indicates if the logout was successful',
      example: true,
   })
   @IsBoolean()
   success: boolean;
}
