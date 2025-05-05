import { IsString, IsEnum, IsOptional, IsDecimal } from 'class-validator';
import { IngredientCategory } from '../../../shared/enums/ingredient-category.enum';

export class CreateIngredientDto {
   @IsString()
   name: string;

   @IsEnum(IngredientCategory)
   category: IngredientCategory;

   @IsString()
   @IsOptional()
   description?: string;

   @IsString()
   @IsOptional()
   unit?: string;

   @IsDecimal()
   @IsOptional()
   averageCost?: number;

   @IsString()
   @IsOptional()
   allergenInfo?: string;

   @IsString()
   @IsOptional()
   nutritionalInfo?: string;
}
