import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from '@modules/ingredient/entities/recipe-ingredient.entity';
import { Ingredient } from '@modules/ingredient/entities/ingredient.entity';
import { MenuItem } from '@modules/menu/entities/menu.entity';

@Module({
   imports: [
      TypeOrmModule.forFeature([
         Recipe,
         RecipeIngredient,
         Ingredient,
         MenuItem,
      ]),
   ],
   controllers: [RecipeController],
   providers: [RecipeService],
   exports: [RecipeService],
})
export class RecipeModule {}
