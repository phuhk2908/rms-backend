import { ApiProperty } from '@nestjs/swagger';
import {
   IsUUID,
   IsDecimal,
   IsString,
   IsNotEmpty,
   IsOptional,
} from 'class-validator';

export class AddIngredientToRecipeDto {
   @ApiProperty({
      description: 'The ID of the ingredient to add to the recipe',
   })
   @IsUUID()
   ingredientId: string;

   @ApiProperty({
      description: 'The quantity of the ingredient needed for the recipe',
   })
   @IsDecimal()
   quantity: number;

   @IsString()
   @IsNotEmpty()
   unit: string;

   @IsString()
   @IsOptional()
   preparationNotes?: string;
}
