// src/shared/entities/recipe-ingredient.entity.ts
import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { Recipe } from '@modules/recipe/entities/recipe.entity';
import { Ingredient } from '@modules/ingredient/entities/ingredient.entity';

@Entity()
export class RecipeIngredient extends BaseEntity {
   @Column('decimal', { precision: 10, scale: 2 })
   quantity: number;

   @Column()
   unit: string;

   @Column({ nullable: true })
   preparationNotes: string;

   @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
   recipe: Recipe;

   @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients)
   ingredient: Ingredient;
}
