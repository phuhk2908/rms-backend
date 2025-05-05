import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { InventoryItemController } from './inventory-item.controller';
import { InventoryItemService } from './inventory-item.service';
import { IngredientModule } from '../ingredient/ingredient.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([InventoryItem, Supplier, Ingredient]),
      IngredientModule,
   ],
   controllers: [InventoryItemController],
   providers: [InventoryItemService],
   exports: [InventoryItemService],
})
export class InventoryItemModule {}
