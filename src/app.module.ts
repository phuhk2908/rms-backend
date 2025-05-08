import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@modules/user/user.module';
import { MenuModule } from '@modules/menu/menu.module';

import { SupplierModule } from './modules/supplier/supplier.module';
import { InventoryItemModule } from './modules/inventory-item/inventory-item.module';
import { OrderModule } from './modules/order/order.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { TableModule } from './modules/table/table.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { KitchenDisplayModule } from '@modules/kitchen-display/kitchen-display.module';
import { AuthModule } from '@modules/auth/auth.module';
import { IngredientModule } from '@modules/ingredient/ingredient.module';
import { ReportModule } from '@modules/report/report.module';
import { RecipeModule } from '@modules/recipe/recipe.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         envFilePath:
            process.env.NODE_ENV === 'development'
               ? '.env.development'
               : '.env',
      }),
      TypeOrmModule.forRootAsync(databaseConfig),
      UserModule,
      AuthModule,
      IngredientModule,
      RecipeModule,
      MenuModule,
      OrderModule,
      SupplierModule,
      TableModule,
      ReservationModule,
      InventoryItemModule,
      PaymentModule,
      NotificationModule,
      KitchenDisplayModule,
      ReportModule,
   ],
   controllers: [AppController],
   providers: [AppService],
   exports: [AppService],
})
export class AppModule {}
