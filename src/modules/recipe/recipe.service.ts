import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Recipe } from '@prisma/client'; // For transaction type
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipeService {
  private readonly logger = new Logger(RecipeService.name);

  constructor(private prisma: PrismaService) {}

  async createRecipe(dto: CreateRecipeDto): Promise<Recipe> {
    this.logger.log(`Creating recipe: ${dto.name}`);
    const { ingredients, menuItemId, ...recipeData } = dto;

    // Validate all ingredient IDs exist before transaction
    for (const ing of ingredients) {
      const ingredientExists = await this.prisma.ingredient.findUnique({
        where: { id: ing.ingredientId },
      });
      if (!ingredientExists) {
        throw new NotFoundException(
          `Ingredient with ID '${ing.ingredientId}' for recipe not found.`,
        );
      }
    }
    if (menuItemId) {
      const menuItemExists = await this.prisma.menuItem.findUnique({
        where: { id: menuItemId },
      });
      if (!menuItemExists) {
        throw new NotFoundException(
          `Menu Item with ID '${menuItemId}' for recipe not found.`,
        );
      }
    }

    return this.prisma
      .$transaction(async (tx) => {
        const newRecipe = await tx.recipe.create({
          data: {
            ...recipeData,
            ...(menuItemId && { menuItem: { connect: { id: menuItemId } } }),
            // RecipeIngredients are created separately below
          },
        });

        const recipeIngredientsData = ingredients.map((ing) => ({
          recipeId: newRecipe.id,
          ingredientId: ing.ingredientId,
          quantityNeeded: ing.quantityNeeded,
        }));

        await tx.recipeIngredient.createMany({
          data: recipeIngredientsData,
        });
        this.logger.log(
          `Recipe '${newRecipe.name}' and its ingredients created successfully.`,
        );
        // Return the recipe with its ingredients
        return tx.recipe.findUniqueOrThrow({
          // Use OrThrow to ensure it exists
          where: { id: newRecipe.id },
          include: {
            recipeIngredients: { include: { ingredient: true } },
            menuItem: true,
          },
        });
      })
      .catch((error) => {
        this.logger.error(
          `Failed to create recipe ${dto.name}: ${error.message}`,
          error.stack,
        );
        // Check for P2025 related to menuItemId if not pre-validated
        if (
          error.code === 'P2025' &&
          error.message.includes(
            'An operation failed because it depends on one or more records that were required but not found.',
          )
        ) {
          throw new NotFoundException(
            `Could not create recipe. Ensure Menu Item ID (if provided) and all Ingredient IDs are valid.`,
          );
        }
        throw new InternalServerErrorException('Could not create recipe.');
      });
  }

  async findAllRecipes(): Promise<Recipe[]> {
    this.logger.log('Fetching all recipes');
    return this.prisma.recipe.findMany({
      include: {
        recipeIngredients: { include: { ingredient: true } }, // Include ingredient details
        menuItem: true, // Include linked menu item
      },
    });
  }

  async findOneRecipe(id: string): Promise<Recipe | null> {
    this.logger.log(`Fetching recipe with ID: ${id}`);
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        recipeIngredients: { include: { ingredient: true } },
        menuItem: true,
      },
    });
    if (!recipe) {
      this.logger.warn(`Recipe with ID ${id} not found.`);
    }
    return recipe;
  }

  async updateRecipe(id: string, dto: UpdateRecipeDto): Promise<Recipe> {
    this.logger.log(`Updating recipe with ID: ${id}`);
    const { ingredients, menuItemId, ...recipeData } = dto;

    // Pre-validation for existence of related entities if IDs are provided
    if (menuItemId) {
      const menuItemExists = await this.prisma.menuItem.findUnique({
        where: { id: menuItemId },
      });
      if (!menuItemExists)
        throw new NotFoundException(
          `Menu Item with ID '${menuItemId}' for recipe update not found.`,
        );
    }
    if (ingredients) {
      for (const ing of ingredients) {
        if (ing.ingredientId) {
          // Only if ingredientId is part of update
          const ingredientExists = await this.prisma.ingredient.findUnique({
            where: { id: ing.ingredientId },
          });
          if (!ingredientExists)
            throw new NotFoundException(
              `Ingredient with ID '${ing.ingredientId}' for recipe update not found.`,
            );
        }
      }
    }

    return this.prisma
      .$transaction(async (tx) => {
        const updatedRecipe = await tx.recipe.update({
          where: { id },
          data: {
            ...recipeData,
            ...(menuItemId !== undefined && {
              // Allow setting menuItem to null or connecting to new
              menuItem: menuItemId
                ? { connect: { id: menuItemId } }
                : { disconnect: true },
            }),
          },
        });

        if (ingredients) {
          // If ingredients are provided, replace them
          // Delete existing recipe ingredients for this recipe
          await tx.recipeIngredient.deleteMany({
            where: { recipeId: id },
          });

          // Create new recipe ingredients
          if (ingredients.length > 0) {
            const recipeIngredientsData = ingredients
              .filter((ing) => ing.ingredientId && ing.quantityNeeded) // ensure valid entries
              .map((ing) => ({
                recipeId: id,
                ingredientId: ing.ingredientId!,
                quantityNeeded: ing.quantityNeeded!,
              }));
            if (recipeIngredientsData.length > 0) {
              await tx.recipeIngredient.createMany({
                data: recipeIngredientsData,
              });
            }
          }
          this.logger.log(
            `Ingredients for recipe '${updatedRecipe.name}' (ID: ${id}) have been updated.`,
          );
        }

        this.logger.log(
          `Recipe '${updatedRecipe.name}' (ID: ${id}) updated successfully.`,
        );
        return tx.recipe.findUniqueOrThrow({
          // OrThrow to ensure it exists
          where: { id },
          include: {
            recipeIngredients: { include: { ingredient: true } },
            menuItem: true,
          },
        });
      })
      .catch((error) => {
        this.logger.error(
          `Failed to update recipe ${id}: ${error.message}`,
          error.stack,
        );
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Recipe with ID '${id}' not found, or a related record (Menu Item, Ingredient) was not found.`,
          );
        }
        throw new InternalServerErrorException('Could not update recipe.');
      });
  }

  async removeRecipe(id: string): Promise<Recipe> {
    this.logger.log(`Removing recipe with ID: ${id}`);
    // Prisma will cascade delete RecipeIngredients due to onDelete: Cascade in schema
    try {
      return await this.prisma.recipe.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Recipe with ID '${id}' not found.`);
      }
      this.logger.error(
        `Failed to remove recipe ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not remove recipe.');
    }
  }
}
