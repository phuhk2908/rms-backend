import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TableModule } from '../table/table.module';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, AuthModule, TableModule], // Include TableModule
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService], // For OrderModule
})
export class ReservationModule {}
