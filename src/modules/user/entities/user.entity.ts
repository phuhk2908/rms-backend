import { Order } from '@modules/order/entities/order.entity';
import { Reservation } from '@modules/reservation/entities/reservation.entity';
import { BaseEntity } from '@shared/entities/base.entity';
import { UserRole } from '@shared/enums/user-role.enum';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
   @Column({ unique: true })
   email: string;

   @Column()
   @Exclude()
   password: string;

   @Column({ nullable: true })
   firstName: string;

   @Column({ nullable: true })
   lastName: string;

   @Column({ type: 'enum', enum: UserRole, default: UserRole.WAITER })
   role?: UserRole;

   @Column({ nullable: true })
   phoneNumber?: string;

   @OneToMany(() => Order, (order) => order.waiter)
   orders: Order[];

   @OneToMany(() => Reservation, (reservation) => reservation.createdBy)
   reservations: Reservation[];

   @Column({ nullable: true })
   @Exclude()
   refreshToken: string;
}
