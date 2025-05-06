import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { InventoryItem } from '@modules/inventory-item/entities/inventory-item.entity';
import { Ingredient } from './entities/ingredient.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { InventoryItemModule } from '@modules/inventory-item/inventory-item.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([Ingredient, RecipeIngredient, InventoryItem]),
      forwardRef(() => InventoryItemModule),
   ],
   controllers: [IngredientController],
   providers: [IngredientService],
   exports: [IngredientService],
})
export class IngredientModule {}
