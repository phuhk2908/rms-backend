import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { Order } from '@modules/order/entities/order.entity';
import { Reservation } from '@modules/reservation/entities/reservation.entity';
import { TableStatus } from '@shared/enums/table-status.enum';

@Entity()
export class Table extends BaseEntity {
   @Column()
   number: string;

   @Column()
   capacity: number;

   @Column({ type: 'enum', enum: TableStatus, default: TableStatus.AVAILABLE })
   status: TableStatus;

   @Column({ type: 'text', nullable: true })
   location: string;

   @OneToMany(() => Order, (order) => order.table)
   orders: Order[];

   @OneToMany(() => Reservation, (reservation) => reservation.table)
   reservations: Reservation[];
}
