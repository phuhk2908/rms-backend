import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MenuModule } from '../menu/menu.module';
import { TableModule } from '../table/table.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TableModule,
    MenuModule,
    // InventoryModule // Add when stock deduction is implemented
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
