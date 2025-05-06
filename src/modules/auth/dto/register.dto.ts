import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
   @IsEmail()
   email: string;

   @IsString()
   @MinLength(8)
   password: string;

   @IsNotEmpty()
   firstName: string;

   @IsNotEmpty()
   lastName: string;

   @IsNotEmpty()
   phoneNumber: string;
}
