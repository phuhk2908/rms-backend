import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'The email address of the user.',
        example: 'staff@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'The OTP (One-Time Password) received via email.',
        example: '123456',
    })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        description: 'The new password for the user. Must be at least 8 characters.',
        example: 'NewSecurePassword123!',
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @IsNotEmpty()
    password: string;
}