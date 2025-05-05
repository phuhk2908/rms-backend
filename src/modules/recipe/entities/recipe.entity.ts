// src/shared/entities/recipe.entity.ts
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { RecipeIngredient } from '@modules/ingredient/entities/recipe-ingredient.entity';
import { MenuItem } from '@modules/menu/entities/menu.entity';

@Entity()
export class Recipe extends BaseEntity {
   @Column()
   name: string;

   @Column({ type: 'text' })
   instructions: string;

   @Column({ type: 'int' })
   preparationTime: number; // in minutes

   @Column({ type: 'int' })
   cookingTime: number; // in minutes

   @Column({ type: 'int', default: 1 })
   servings: number;

   @Column({ type: 'text', nullable: true })
   notes: string;

   @Column({ type: 'text', nullable: true })
   equipmentNeeded: string;

   @OneToMany(
      () => RecipeIngredient,
      (recipeIngredient) => recipeIngredient.recipe,
   )
   ingredients: RecipeIngredient[];

   @ManyToOne(() => MenuItem, (menuItem) => menuItem.recipes)
   menuItem: MenuItem;
}
