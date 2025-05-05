import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrderModule } from '../order/order.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([Payment, Order]),
      forwardRef(() => OrderModule),
   ],
   controllers: [PaymentController],
   providers: [PaymentService],
   exports: [PaymentService],
})
export class PaymentModule {}
