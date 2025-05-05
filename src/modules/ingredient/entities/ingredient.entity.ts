// src/shared/entities/ingredient.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { RecipeIngredient } from '@modules/ingredient/entities/recipe-ingredient.entity';
import { InventoryItem } from '@modules/inventory-item/entities/inventory-item.entity';
import { IngredientCategory } from '@shared/enums/ingredient-category.enum';

@Entity()
export class Ingredient extends BaseEntity {
   @Column()
   name: string;

   @Column({ type: 'enum', enum: IngredientCategory })
   category: IngredientCategory;

   @Column({ nullable: true })
   description: string;

   @Column({ nullable: true })
   unit: string;

   @Column('decimal', { precision: 10, scale: 2, nullable: true })
   averageCost: number;

   @Column({ nullable: true })
   allergenInfo: string;

   @Column({ nullable: true })
   nutritionalInfo: string;

   @OneToMany(
      () => RecipeIngredient,
      (recipeIngredient) => recipeIngredient.ingredient,
   )
   recipeIngredients: RecipeIngredient[];

   @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.ingredient)
   inventoryItems: InventoryItem[];
}
