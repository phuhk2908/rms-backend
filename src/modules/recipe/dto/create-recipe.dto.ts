import {
   IsUUID,
   IsString,
   IsInt,
   IsNotEmpty,
   IsOptional,
} from 'class-validator';

export class CreateRecipeDto {
   @IsUUID()
   menuItemId: string;

   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsNotEmpty()
   instructions: string;

   @IsInt()
   preparationTime: number;

   @IsInt()
   cookingTime: number;

   @IsInt()
   @IsOptional()
   servings?: number;

   @IsString()
   @IsOptional()
   notes?: string;

   @IsString()
   @IsOptional()
   equipmentNeeded?: string;
}
