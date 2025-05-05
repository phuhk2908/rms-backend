import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Table } from '@modules/table/entities/table.entity';
import { User } from '@modules/user/entities/user.entity';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([Reservation, Table, User]),
      NotificationModule,
   ],
   controllers: [ReservationController],
   providers: [ReservationService],
   exports: [ReservationService],
})
export class ReservationModule {}
