import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
    @ApiProperty({ description: 'The email address to resend the verification OTP to.', example: 'new.staff@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}