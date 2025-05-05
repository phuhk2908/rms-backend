import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Reservation } from '@modules/reservation/entities/reservation.entity';
import { Order } from '@modules/order/entities/order.entity';

@Injectable()
export class NotificationService {
   constructor(private readonly mailerService: MailerService) {}

   async sendReservationConfirmation(
      email: string,
      reservation: Reservation,
   ): Promise<void> {
      await this.mailerService.sendMail({
         to: email,
         subject: 'Reservation Confirmation',
         template: 'reservation-confirmation',
         context: {
            name: reservation.customerName,
            date: reservation.reservationTime.toLocaleDateString(),
            time: reservation.reservationTime.toLocaleTimeString(),
            partySize: reservation.partySize,
            tableNumber: reservation.table.number,
         },
      });
   }

   async sendOrderConfirmation(email: string, order: Order): Promise<void> {
      await this.mailerService.sendMail({
         to: email,
         subject: 'Order Confirmation',
         template: 'order-confirmation',
         context: {
            orderId: order.id,
            items: order.items.map((item) => ({
               name: item.menuItem.name,
               quantity: item.quantity,
               price: item.menuItem.price,
            })),
            total: order.items.reduce(
               (sum, item) => sum + item.quantity * item.menuItem.price,
               0,
            ),
         },
      });
   }

   async sendLowStockAlert(
      emails: string[],
      items: { name: string; current: number; minimum: number }[],
   ): Promise<void> {
      await this.mailerService.sendMail({
         to: emails.join(','),
         subject: 'Low Stock Alert',
         template: 'low-stock-alert',
         context: {
            items,
         },
      });
   }
}
