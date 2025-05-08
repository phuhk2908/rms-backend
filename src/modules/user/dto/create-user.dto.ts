import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
   @ApiProperty({ example: 'test@example.com', description: 'The email of the user' })
   @IsEmail()
   email: string;

   @ApiProperty({ example: 'password123', description: 'The password of the user' })
   @IsNotEmpty()
   password: string;

   @ApiProperty({ example: 'John', description: 'The first name of the user' })
   @IsNotEmpty()
   firstName: string;

   @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
   @IsNotEmpty()
   lastName: string;

   @ApiProperty({ example: UserRole.CUSTOMER, description: 'The role of the user', enum: UserRole, required: false })
   @IsEnum(UserRole)
   @IsOptional()
   role: UserRole;

   @ApiProperty({ example: '123-456-7890', description: 'The phone number of the user', required: false })
   @IsOptional()
   phoneNumber: string;
}
