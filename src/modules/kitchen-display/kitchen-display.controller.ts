import {
   Controller,
   Get,
   Put,
   Param,
   ParseUUIDPipe,
   UseGuards,
} from '@nestjs/common';
import { KitchenDisplayService } from './kitchen-display.service';

import { UserRole } from '../../shared/enums/user-role.enum';
import { OrderItemStatus } from '../../shared/enums/order-item-status.enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('kitchen-display')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KitchenDisplayController {
   constructor(private readonly kitchenDisplayService: KitchenDisplayService) {}

   @Get()
   @Roles(UserRole.CHEF, UserRole.BARTENDER, UserRole.MANAGER, UserRole.ADMIN)
   getActiveOrders() {
      return this.kitchenDisplayService.getActiveOrders();
   }

   @Put(':orderId/items/:itemId/status/:status')
   @Roles(UserRole.CHEF, UserRole.BARTENDER, UserRole.MANAGER, UserRole.ADMIN)
   updateItemStatus(
      @Param('orderId', ParseUUIDPipe) orderId: string,
      @Param('itemId', ParseUUIDPipe) itemId: string,
      @Param('status') status: OrderItemStatus,
   ) {
      return this.kitchenDisplayService.updateOrderItemStatus(
         orderId,
         itemId,
         status,
      );
   }
}
