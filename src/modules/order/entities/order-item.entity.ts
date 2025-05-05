import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { Order } from './order.entity';
import { MenuItem } from '@modules/menu/entities/menu.entity';
import { OrderItemStatus } from '@shared/enums/order-item-status.enum';

@Entity()
export class OrderItem extends BaseEntity {
   @Column()
   quantity: number;

   @Column({ type: 'text', nullable: true })
   specialInstructions: string;

   @Column({
      type: 'enum',
      enum: OrderItemStatus,
      default: OrderItemStatus.PENDING,
   })
   status: OrderItemStatus;

   @ManyToOne(() => Order, (order) => order.items)
   order: Order;

   @ManyToOne(() => MenuItem, (menuItem) => menuItem.orderItems)
   menuItem: MenuItem;
}
