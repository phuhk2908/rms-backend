import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { InventoryItem } from '@modules/inventory-item/entities/inventory-item.entity';
import { Ingredient } from './entities/ingredient.entity';

@Injectable()
export class IngredientService {
   constructor(
      @InjectRepository(Ingredient)
      private readonly ingredientRepository: Repository<Ingredient>,
      @InjectRepository(InventoryItem)
      private readonly inventoryItemRepository: Repository<InventoryItem>,
   ) {}

   async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
      const ingredient = this.ingredientRepository.create(createIngredientDto);
      return this.ingredientRepository.save(ingredient);
   }

   async findAll(): Promise<Ingredient[]> {
      return this.ingredientRepository.find({
         relations: ['inventoryItems'],
      });
   }

   async findOne(id: string): Promise<Ingredient> {
      const ingredient = await this.ingredientRepository.findOne({
         where: { id },
         relations: ['inventoryItems', 'recipeIngredients'],
      });

      if (!ingredient) {
         throw new NotFoundException('Ingredient not found');
      }

      return ingredient;
   }

   async update(
      id: string,
      updateIngredientDto: UpdateIngredientDto,
   ): Promise<Ingredient> {
      const ingredient = await this.findOne(id);
      return this.ingredientRepository.save({
         ...ingredient,
         ...updateIngredientDto,
      });
   }

   async remove(id: string): Promise<void> {
      const ingredient = await this.findOne(id);
      await this.ingredientRepository.remove(ingredient);
   }

   async getCurrentStock(id: string): Promise<number> {
      const inventoryItems = await this.inventoryItemRepository.find({
         where: { ingredient: { id } },
      });

      return inventoryItems.reduce((total, item) => total + item.quantity, 0);
   }

   async getRecipesUsingIngredient(id: string): Promise<any[]> {
      const ingredient = await this.ingredientRepository.findOne({
         where: { id },
         relations: ['recipeIngredients', 'recipeIngredients.recipe'],
      });

      if (!ingredient) {
         throw new NotFoundException('Ingredient not found');
      }

      return ingredient.recipeIngredients.map((ri) => ({
         recipeId: ri.recipe.id,
         recipeName: ri.recipe.name,
         quantity: ri.quantity,
         unit: ri.unit,
      }));
   }
}
