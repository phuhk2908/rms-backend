import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@shared/enums/user-role.enum';

export class UserProfileDto {
   @ApiProperty({
      description: 'The unique identifier of the user',
      example: '123e4567-e89b-12d3-a456-426614174000',
   })
   id: string;

   @ApiProperty({
      description: 'The email address of the user',
      example: 'user@example.com',
   })
   email: string;

   @ApiProperty({
      description: 'The first name of the user',
      example: 'John',
   })
   firstName: string;

   @ApiProperty({
      description: 'The last name of the user',
      example: 'Doe',
   })
   lastName: string;

   @ApiProperty({
      description: 'The role of the user',
      enum: UserRole,
      example: UserRole.WAITER,
   })
   role: UserRole;

   @ApiProperty({
      description: 'The phone number of the user',
      example: '+1234567890',
      required: false,
   })
   phoneNumber?: string;

   @ApiProperty({
      description: 'The date when the user was created',
      example: '2024-01-01T00:00:00.000Z',
   })
   createdAt: Date;

   @ApiProperty({
      description: 'The date when the user was last updated',
      example: '2024-01-01T00:00:00.000Z',
   })
   updatedAt: Date;
}

export class LoginResponseDto {
   @ApiProperty({
      description: 'The user profile information',
      type: UserProfileDto,
   })
   user: UserProfileDto;

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
   accessToken: string;
}

export class LogoutResponseDto {
   @ApiProperty({
      description: 'Indicates if the logout was successful',
      example: true,
   })
   success: boolean;
} 