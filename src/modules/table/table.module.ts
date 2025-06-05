import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService], // For ReservationModule
})
export class TableModule {}
