import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateSupplierDto {
   @IsString()
   name: string;

   @IsString()
   contactPerson: string;

   @IsString()
   phone: string;

   @IsEmail()
   email: string;

   @IsString()
   @IsOptional()
   address?: string;
}
