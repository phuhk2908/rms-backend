import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDto {
    @ApiProperty({ description: 'The email address to verify.', example: 'new.staff@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The 6-digit OTP received via email.', example: '123456' })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'OTP must be 6 digits.' })
    token: string;
}
