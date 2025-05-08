import {
   IsUUID,
   IsNotEmpty,
   IsString,
   IsInt,
   IsOptional,
   IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
   @IsUUID()
   @ApiProperty({ description: 'The ID of the menu item this recipe is for', example: '123e4567-e89b-12d3-a456-426614174000' })
   menuItemId: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ description: 'The name of the recipe', example: 'Spaghetti Bolognese' })
   name: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ description: 'The instructions for the recipe', example: 'Boil water, cook pasta, add sauce.' })
   instructions: string;

   @IsNumber()
   preparationTime: number;
   @ApiProperty({ description: 'The preparation time in minutes', example: 15 })

   @IsNumber()
   cookingTime: number;
   @ApiProperty({ description: 'The cooking time in minutes', example: 30 })

   @IsInt()
   @IsOptional()
   servings?: number;
   @ApiProperty({ description: 'The number of servings the recipe yields', example: 4, required: false })

   @IsString()
   @IsOptional()
   notes?: string;
   @ApiProperty({ description: 'Additional notes about the recipe', example: 'Can add more chili for spice.', required: false })

   @IsString()
   @IsOptional()
   @ApiProperty({ description: 'Equipment needed for the recipe', example: 'Large pot, frying pan', required: false })
   equipmentNeeded?: string;
}

