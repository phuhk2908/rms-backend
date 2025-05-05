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
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
   constructor(private readonly paymentService: PaymentService) {}

   @Post()
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   create(@Body() createPaymentDto: CreatePaymentDto) {
      return this.paymentService.create(createPaymentDto);
   }

   @Get()
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   findAll() {
      return this.paymentService.findAll();
   }

   @Get('order/:orderId')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   findByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
      return this.paymentService.findByOrder(orderId);
   }

   @Get(':id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.paymentService.findOne(id);
   }

   @Put(':id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updatePaymentDto: UpdatePaymentDto,
   ) {
      return this.paymentService.update(id, updatePaymentDto);
   }

   @Put(':id/refund')
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   refund(@Param('id', ParseUUIDPipe) id: string) {
      return this.paymentService.refund(id);
   }

   @Delete(':id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.paymentService.remove(id);
   }

   @Get('order/:orderId/total')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN, UserRole.CASHIER)
   getTotalPaid(@Param('orderId', ParseUUIDPipe) orderId: string) {
      return this.paymentService.getTotalPaid(orderId);
   }
}
