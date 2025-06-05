import {
  ValidateNested,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer'; // For @Type decorator
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRecipeIngredientDto } from './create-recipe-ingredient.dto';

export class CreateRecipeDto {
  @ApiProperty({
    example: 'Deluxe Burger Build',
    description: 'Name of the recipe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Steps to assemble the Deluxe Burger.',
    description: 'Description of the recipe',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '1. Cook patty. 2. Toast bun. 3. Assemble.',
    description: 'Cooking or preparation instructions',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'How many portions/units this recipe yields',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yield?: number;

  @ApiPropertyOptional({
    example: 'burger',
    description: 'Unit of the yield (e.g., servings, grams, ml)',
  })
  @IsOptional()
  @IsString()
  yieldUnit?: string;

  @ApiPropertyOptional({
    example: 'uuid-for-menu-item',
    description: 'Optional: ID of the menu item this recipe primarily produces',
  })
  @IsOptional()
  @IsUUID()
  menuItemId?: string;

  @ApiProperty({
    type: [CreateRecipeIngredientDto],
    description: 'List of ingredients and their quantities for this recipe',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto) // Important for class-validator to use the nested DTO
  ingredients: CreateRecipeIngredientDto[];
}
