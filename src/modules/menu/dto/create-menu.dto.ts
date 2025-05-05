import {
   IsUUID,
   IsString,
   IsNotEmpty,
   IsNumber,
   IsBoolean,
} from 'class-validator';

export class CreateMenuDto {
   @IsUUID()
   categoryId: string;

   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsNotEmpty()
   description: string;

   @IsNumber()
   price: number;

   @IsBoolean()
   isActive: boolean;

   @IsString()
   @IsNotEmpty()
   imageUrl: string;

   @IsNumber()
   preparationTime: number;
}
