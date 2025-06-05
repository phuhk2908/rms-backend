import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StaffModule } from './modules/staff/staff.module';
import { MenuModule } from './modules/menu/menu.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { TableModule } from './modules/table/table.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    StaffModule,
    MenuModule,
    InventoryModule,
    RecipeModule,
    TableModule,
    ReservationModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
