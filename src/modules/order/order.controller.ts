import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   ParseUUIDPipe,
   Put,
   Delete,
   UseGuards,
   Request,
   Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { OrderStatus } from '../../shared/enums/order-status.enum';
import { OrderItemStatus } from '../../shared/enums/order-item-status.enum';
import { CreatePaymentDto } from '@modules/payment/dto/create-payment.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
   constructor(private readonly orderService: OrderService) {}

   @Post()
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN)
   create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
      return this.orderService.create(createOrderDto, req.user.id);
   }

   @Get()
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CHEF, UserRole.BARTENDER)
   findAll(@Query('status') status?: OrderStatus) {
      if (status) {
         return this.orderService.findByStatus(status);
      }
      return this.orderService.findAll();
   }

   @Get(':id')
   findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.orderService.findOne(id);
   }

   @Get('table/:tableId')
   findByTable(@Param('tableId', ParseUUIDPipe) tableId: string) {
      return this.orderService.findByTable(tableId);
   }

   @Put(':id')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN)
   update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateOrderDto: UpdateOrderDto,
   ) {
      return this.orderService.update(id, updateOrderDto);
   }

   @Put(':id/status/:status')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN, UserRole.CHEF)
   updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('status') status: OrderStatus,
   ) {
      return this.orderService.updateStatus(id, status);
   }

   @Put(':orderId/items/:itemId/status/:status')
   @Roles(UserRole.CHEF, UserRole.BARTENDER, UserRole.MANAGER, UserRole.ADMIN)
   updateOrderItemStatus(
      @Param('orderId', ParseUUIDPipe) orderId: string,
      @Param('itemId', ParseUUIDPipe) itemId: string,
      @Param('status') status: OrderItemStatus,
   ) {
      return this.orderService.updateOrderItemStatus(orderId, itemId, status);
   }

   @Get(':id/total')
   calculateTotal(@Param('id', ParseUUIDPipe) id: string) {
      return this.orderService.calculateTotal(id);
   }

   @Post(':id/payments')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   addPayment(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() createPaymentDto: CreatePaymentDto,
   ) {
      return this.orderService.addPaymentToOrder(
         id,
         createPaymentDto.method,
         createPaymentDto.amount,
      );
   }

   @Delete(':id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.orderService.remove(id);
   }
}
