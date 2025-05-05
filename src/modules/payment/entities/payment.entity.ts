import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { Order } from '@modules/order/entities/order.entity';
import { PaymentMethod } from '@shared/enums/payment-method.enum';
import { PaymentStatus } from '@shared/enums/payment-status.enum';

@Entity()
export class Payment extends BaseEntity {
   @Column('decimal', { precision: 10, scale: 2 })
   amount: number;

   @Column({ type: 'enum', enum: PaymentMethod })
   method: PaymentMethod;

   @Column({
      type: 'enum',
      enum: PaymentStatus,
      default: PaymentStatus.PENDING,
   })
   status: PaymentStatus;

   @Column({ type: 'text', nullable: true })
   transactionId: string;

   @Column({ type: 'text', nullable: true })
   notes: string;

   @ManyToOne(() => Order, (order) => order.payments)
   order: Order;
}
