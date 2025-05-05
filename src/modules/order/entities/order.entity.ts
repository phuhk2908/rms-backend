import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { OrderStatus } from '@shared/enums/order-status.enum';
import { OrderItem } from './order-item.entity';
import { Table } from '@modules/table/entities/table.entity';
import { Payment } from '@modules/payment/entities/payment.entity';

@Entity()
export class Order extends BaseEntity {
   @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
   status: OrderStatus;

   @Column({ type: 'text', nullable: true })
   notes: string;

   @ManyToOne(() => User, (user) => user.orders)
   waiter: User;

   @ManyToOne(() => Table, (table) => table.orders)
   table: Table;

   @OneToMany(() => OrderItem, (item) => item.order)
   items: OrderItem[];

   @OneToMany(() => Payment, (payment) => payment.order)
   payments: Payment[];
}
