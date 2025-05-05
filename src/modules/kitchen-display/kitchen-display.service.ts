import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Order } from '../order/entities/order.entity';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../../shared/enums/order-status.enum';
import { OrderItemStatus } from '../../shared/enums/order-item-status.enum';

@Injectable()
export class KitchenDisplayService {
   constructor(
      @Inject(forwardRef(() => OrderService))
      private readonly orderService: OrderService,
   ) {}

   async sendOrderToKitchen(order: Order): Promise<void> {
      // In a real implementation, this would push to a WebSocket or other real-time service
      console.log('Order sent to kitchen display:', order);
   }

   async getActiveOrders(): Promise<Order[]> {
      return this.orderService.findByStatus(OrderStatus.IN_PROGRESS);
   }

   async updateOrderItemStatus(
      orderId: string,
      itemId: string,
      status: OrderItemStatus,
   ): Promise<void> {
      await this.orderService.updateOrderItemStatus(orderId, itemId, status);

      // Check if all items are completed
      const order = await this.orderService.findOne(orderId);
      const allItemsReady = order.items.every(
         (item) => item.status === OrderItemStatus.READY,
      );

      if (allItemsReady) {
         await this.orderService.updateStatus(orderId, OrderStatus.COMPLETED);
      }
   }
}
