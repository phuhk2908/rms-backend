import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { IngredientModule } from '../ingredient/ingredient.module';
import { MenuModule } from '../menu/menu.module';
import { Ingredient } from '@modules/ingredient/entities/ingredient.entity';
import { RecipeIngredient } from '@modules/ingredient/entities/recipe-ingredient.entity';
import { MenuItem } from '@modules/menu/entities/menu.entity';
import { Recipe } from './entities/recipe.entity';

@Module({
   imports: [
      TypeOrmModule.forFeature([
         Recipe,
         RecipeIngredient,
         Ingredient,
         MenuItem,
      ]),
      IngredientModule,
      MenuModule,
   ],
   controllers: [RecipeController],
   providers: [RecipeService],
   exports: [RecipeService],
})
export class RecipeModule {}
