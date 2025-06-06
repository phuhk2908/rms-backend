import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'Email address for the new staff member',
    })
    @IsEmail({}, { message: 'Please enter a valid email address.' })
    @IsNotEmpty({ message: 'Email should not be empty.' })
    email: string;

    @ApiProperty({
        example: 'SecureP@ss123!',
        description: 'Password for the new staff member (min 8 characters)',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password should not be empty.' })
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password: string;

    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'Full name of the staff member',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Name should not be empty if provided.' })
    name?: string;

}
