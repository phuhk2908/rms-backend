import {
   IsUUID,
   IsDecimal,
   IsString,
   IsNotEmpty,
   IsOptional,
} from 'class-validator';

export class AddIngredientToRecipeDto {
   @IsUUID()
   ingredientId: string;

   @IsDecimal()
   quantity: number;

   @IsString()
   @IsNotEmpty()
   unit: string;

   @IsString()
   @IsOptional()
   preparationNotes?: string;
}
