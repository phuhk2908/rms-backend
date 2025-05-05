import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { MenuItem } from '@modules/menu/entities/menu.entity';
import { MenuModule } from '@modules/menu/menu.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { TableModule } from '@modules/table/table.module';
import { User } from '@modules/user/entities/user.entity';
import { UserModule } from '@modules/user/user.module';
import { Table } from '@modules/table/entities/table.entity';
import { OrderItem } from './entities/order-item.entity';
import { KitchenDisplayModule } from '@modules/kitchen-display/kitchen-display.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([Order, OrderItem, Table, User, MenuItem]),
      MenuModule,
      forwardRef(() => TableModule),
      UserModule,
      PaymentModule,
      forwardRef(() => KitchenDisplayModule),
   ],
   controllers: [OrderController],
   providers: [OrderService],
   exports: [OrderService],
})
export class OrderModule {}
