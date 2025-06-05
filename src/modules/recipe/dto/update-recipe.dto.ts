import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateRecipeIngredientDto } from './create-recipe-ingredient.dto';

export class UpdateRecipeIngredientDto extends PartialType(
  CreateRecipeIngredientDto,
) {
  @ApiPropertyOptional({
    example: 'uuid-for-recipe-ingredient-entry',
    description:
      'ID of the existing recipe ingredient entry (for updates within a recipe)',
  })
  @IsOptional()
  @IsUUID()
  id?: string; // Used to identify existing ingredients for update/delete, or new ones
}

export class UpdateRecipeDto {
  @ApiPropertyOptional({
    example: 'Deluxe Burger Build v2',
    description: 'Name of the recipe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated steps to assemble the Deluxe Burger.',
    description: 'Description of the recipe',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example:
      '1. Grill patty. 2. Butter and toast bun. 3. Assemble with special sauce.',
    description: 'Cooking or preparation instructions',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'How many portions/units this recipe yields',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yield?: number;

  @ApiPropertyOptional({ example: 'burgers', description: 'Unit of the yield' })
  @IsOptional()
  @IsString()
  yieldUnit?: string;

  @ApiPropertyOptional({
    example: 'uuid-for-another-menu-item',
    description: 'Optional: ID of the menu item this recipe produces',
  })
  @IsOptional()
  @IsUUID()
  menuItemId?: string; // Can be set to null to detach

  // For updating ingredients, it's complex. You might want to:
  // 1. Replace all ingredients (send new array like in create)
  // 2. Send an array of operations (add, update, delete specific ingredient links)
  // For simplicity, this DTO allows replacing the list or providing a partial list if handled carefully in service.
  // A more robust way for partial updates of ingredients would require more complex DTOs and service logic.
  @ApiPropertyOptional({
    type: [UpdateRecipeIngredientDto],
    description:
      'List of ingredients to update/replace for this recipe. Full replacement is common.',
  })
  @IsOptional()
  @IsArray()
  // @ArrayNotEmpty() // Not necessarily not empty on update
  // @ArrayMinSize(1) // Not necessarily min size 1 on update
  @ValidateNested({ each: true })
  @Type(() => UpdateRecipeIngredientDto)
  ingredients?: UpdateRecipeIngredientDto[];
}
