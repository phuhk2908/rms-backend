import { IsString, IsEnum, IsOptional, IsDecimal } from 'class-validator';
import { IngredientCategory } from '../../../shared/enums/ingredient-category.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
 @ApiProperty({ description: 'The name of the ingredient' })
   @IsString()
   name: string;

 @ApiProperty({ enum: IngredientCategory, description: 'The category of the ingredient' })
   @IsEnum(IngredientCategory)
   category: IngredientCategory;

 @ApiProperty({ description: 'An optional description of the ingredient' })
   @IsString()
   @IsOptional()
   description?: string;

 @ApiProperty({ description: 'An optional unit of measurement for the ingredient' })
   @IsString()
   @IsOptional()
   unit?: string;

 @ApiProperty({ description: 'The average cost of the ingredient' })
   @IsDecimal()
   @IsOptional()
   averageCost?: number;

 @ApiProperty({ description: 'Optional information about allergens in the ingredient' })
   @IsString()
   @IsOptional()
   allergenInfo?: string;

 @ApiProperty({ description: 'Optional nutritional information about the ingredient' })
   @IsString()
   @IsOptional()
   nutritionalInfo?: string;
}
