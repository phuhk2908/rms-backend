import { Module, forwardRef } from '@nestjs/common';
import { KitchenDisplayService } from './kitchen-display.service';
import { OrderModule } from '../order/order.module';
import { KitchenDisplayController } from './kitchen-display.controller';
import { Order } from '@modules/order/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [TypeOrmModule.forFeature([Order]), forwardRef(() => OrderModule)],
   controllers: [KitchenDisplayController],
   providers: [KitchenDisplayService],
   exports: [KitchenDisplayService],
})
export class KitchenDisplayModule {}
