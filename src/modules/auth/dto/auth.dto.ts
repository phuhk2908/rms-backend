import {
   IsEmail,
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsString,
   MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@shared/enums/user-role.enum';

export class LoginDto {
   @ApiProperty({
      description: 'The email address of the user',
      example: 'user@example.com',
   })
   @IsEmail()
   @IsNotEmpty()
   email: string;

   @ApiProperty({
      description: 'The password of the user',
      example: 'password123',
   })
   @IsString()
   @IsNotEmpty()
   password: string;
}

export class RegisterDto {
   @ApiProperty({
      description: 'The email address of the user',
      example: 'user@example.com',
   })
   @IsEmail()
   @IsNotEmpty()
   email: string;

   @ApiProperty({
      description: 'The password of the user (minimum 8 characters)',
      example: 'password123',
      minLength: 8,
   })
   @IsString()
   @MinLength(8)
   @IsNotEmpty()
   password: string;

   @ApiProperty({
      description: 'The first name of the user',
      example: 'John',
   })
   @IsString()
   firstName: string;

   @ApiProperty({
      description: 'The last name of the user',
      example: 'Doe',
   })
   @IsString()
   lastName: string;

   @IsEnum(UserRole)
   @IsOptional()
   role: UserRole;

   @IsOptional()
   phoneNumber: string;
}
