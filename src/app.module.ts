import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { StaffModule } from './modules/staff/staff.module';
import { TableModule } from './modules/table/table.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    StaffModule,
    EmailModule,
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
export class AppModule { }