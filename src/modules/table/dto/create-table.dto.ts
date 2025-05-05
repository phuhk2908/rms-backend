import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateTableDto {
   @IsString()
   @IsNotEmpty()
   number: string;

   @IsInt()
   @IsNotEmpty()
   capacity: number;

   @IsString()
   @IsNotEmpty()
   location: string;
}
