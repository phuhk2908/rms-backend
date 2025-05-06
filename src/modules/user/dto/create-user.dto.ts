import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class CreateUserDto {
   @IsEmail()
   email: string;

   @IsNotEmpty()
   password: string;

   @IsNotEmpty()
   firstName: string;

   @IsNotEmpty()
   lastName: string;

   @IsEnum(UserRole)
   @IsOptional()
   role: UserRole;

   @IsOptional()
   phoneNumber: string;
}
