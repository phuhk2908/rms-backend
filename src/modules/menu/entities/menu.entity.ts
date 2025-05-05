import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { MenuCategory } from '@modules/menu/entities/menu-category.entity';
import { OrderItem } from '@modules/order/entities/order-item.entity';
import { InventoryItem } from '@modules/inventory-item/entities/inventory-item.entity';
import { Recipe } from '@modules/recipe/entities/recipe.entity';

@Entity()
export class MenuItem extends BaseEntity {
   @Column()
   name: string;

   @Column({ type: 'text' })
   description: string;

   @Column('decimal', { precision: 10, scale: 2 })
   price: number;

   @Column({ default: true })
   isActive: boolean;

   @Column({ nullable: true })
   imageUrl: string;

   @Column({ default: 0 })
   preparationTime: number;

   @ManyToOne(() => MenuCategory, (category) => category.items)
   category: MenuCategory;

   @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
   orderItems: OrderItem[];

   @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.menuItem)
   inventoryItems: InventoryItem[];

   @OneToMany(() => Recipe, (recipe) => recipe.menuItem)
   recipes: Recipe[];
}
