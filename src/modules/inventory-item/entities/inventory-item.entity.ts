import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { Supplier } from '@modules/supplier/entities/supplier.entity';
import { MenuItem } from '@modules/menu/entities/menu.entity';
import { InventoryItemCategory } from '@shared/enums/inventory-item-category.enum';
import { Ingredient } from '@modules/ingredient/entities/ingredient.entity';

@Entity()
export class InventoryItem extends BaseEntity {
   @Column()
   name: string;

   @Column({ type: 'enum', enum: InventoryItemCategory })
   category: InventoryItemCategory;

   @Column('decimal', { precision: 10, scale: 2 })
   quantity: number;

   @Column()
   unit: string;

   @Column('decimal', { precision: 10, scale: 2 })
   costPerUnit: number;

   @Column({ type: 'timestamp', nullable: true })
   expiryDate: Date;

   @Column({ type: 'timestamp', nullable: true })
   lastRestocked: Date;

   @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
   minimumQuantity: number;

   @ManyToOne(() => Supplier, (supplier) => supplier.items)
   supplier: Supplier;

   @ManyToOne(() => MenuItem, (menuItem) => menuItem.inventoryItems)
   menuItem: MenuItem;

   @ManyToOne(() => Ingredient, (ingredient) => ingredient.inventoryItems)
   ingredient: Ingredient;
}
