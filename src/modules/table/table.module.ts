import { Module, forwardRef } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { OrderModule } from '@modules/order/order.module';
import { ReservationModule } from '@modules/reservation/reservation.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([Table]),
      forwardRef(() => OrderModule),
      ReservationModule,
   ],
   controllers: [TableController],
   providers: [TableService],
   exports: [TableService],
})
export class TableModule {}
