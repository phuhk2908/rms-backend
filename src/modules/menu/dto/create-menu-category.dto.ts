import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class CreateMenuCategoryDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsNotEmpty()
   description: string;

   @IsNumber()
   displayOrder: number;

   @IsBoolean()
   isActive: boolean;
}
