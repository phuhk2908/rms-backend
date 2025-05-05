import {
   Controller,
   Get,
   Put,
   Param,
   ParseUUIDPipe,
   UseGuards,
} from '@nestjs/common';
import { KitchenDisplayService } from './kitchen-display.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { OrderItemStatus } from '../../shared/enums/order-item-status.enum';

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
