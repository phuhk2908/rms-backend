import { Injectable, NotFoundException } from '@nestjs/common';
import { Ingredient } from '@modules/ingredient/entities/ingredient.entity';
import { RecipeIngredient } from '@modules/ingredient/entities/recipe-ingredient.entity';
import { MenuItem } from '@modules/menu/entities/menu.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';

import { AddIngredientToRecipeDto } from './dto/add-ingredient-to-recipe.dto';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipeService {
   constructor(
      @InjectRepository(Recipe)
      private readonly recipeRepository: Repository<Recipe>,
      @InjectRepository(RecipeIngredient)
      private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
      @InjectRepository(Ingredient)
      private readonly ingredientRepository: Repository<Ingredient>,
      @InjectRepository(MenuItem)
      private readonly menuItemRepository: Repository<MenuItem>,
   ) {}

   async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
      const menuItem = await this.menuItemRepository.findOne({
         where: { id: createRecipeDto.menuItemId },
      });

      if (!menuItem) {
         throw new NotFoundException('Menu item not found');
      }

      const recipe = this.recipeRepository.create({
         ...createRecipeDto,
         menuItem,
      });

      return this.recipeRepository.save(recipe);
   }

   async findAll(): Promise<Recipe[]> {
      return this.recipeRepository.find({
         relations: ['menuItem', 'ingredients', 'ingredients.ingredient'],
      });
   }

   async findOne(id: string): Promise<Recipe> {
      const recipe = await this.recipeRepository.findOne({
         where: { id },
         relations: ['menuItem', 'ingredients', 'ingredients.ingredient'],
      });

      if (!recipe) {
         throw new NotFoundException('Recipe not found');
      }

      return recipe;
   }

   async findByMenuItem(menuItemId: string): Promise<Recipe[]> {
      return this.recipeRepository.find({
         where: { menuItem: { id: menuItemId } },
         relations: ['ingredients', 'ingredients.ingredient'],
      });
   }

   async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
      const recipe = await this.findOne(id);
      return this.recipeRepository.save({ ...recipe, ...updateRecipeDto });
   }

   async remove(id: string): Promise<void> {
      const recipe = await this.findOne(id);
      await this.recipeRepository.remove(recipe);
   }

   async addIngredient(
      recipeId: string,
      addIngredientDto: AddIngredientToRecipeDto,
   ): Promise<RecipeIngredient> {
      const recipe = await this.findOne(recipeId);
      const ingredient = await this.ingredientRepository.findOne({
         where: { id: addIngredientDto.ingredientId },
      });

      if (!ingredient) {
         throw new NotFoundException('Ingredient not found');
      }

      const recipeIngredient = this.recipeIngredientRepository.create({
         ...addIngredientDto,
         recipe,
         ingredient,
      });

      return this.recipeIngredientRepository.save(recipeIngredient);
   }

   async removeIngredient(
      recipeId: string,
      ingredientId: string,
   ): Promise<void> {
      const recipeIngredient = await this.recipeIngredientRepository.findOne({
         where: {
            recipe: { id: recipeId },
            ingredient: { id: ingredientId },
         },
      });

      if (!recipeIngredient) {
         throw new NotFoundException('Ingredient not found in recipe');
      }

      await this.recipeIngredientRepository.remove(recipeIngredient);
   }

   async calculateCost(recipeId: string): Promise<number> {
      const recipe = await this.findOne(recipeId);
      let totalCost = 0;

      for (const ingredient of recipe.ingredients) {
         if (ingredient.ingredient.averageCost) {
            totalCost +=
               ingredient.quantity * ingredient.ingredient.averageCost;
         }
      }

      return parseFloat(totalCost.toFixed(2));
   }
}
