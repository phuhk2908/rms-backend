import {
  UseGuards,
  Controller,
  Logger,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Role, OrderStatus, OrderType } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@ApiTags('Order Management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER) // Staff who can take orders
  @ApiOperation({ summary: 'Create a new order' })
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    this.logger.log(
      `User ${req.user.email} creating order. Type: ${createOrderDto.orderType}`,
    );
    return this.orderService.create(createOrderDto, req.user.id); // Pass logged-in staff ID
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER, Role.KITCHEN_STAFF) // Kitchen needs to see orders
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'orderType', enum: OrderType, required: false })
  @ApiQuery({
    name: 'staffId',
    type: String,
    required: false,
    description: 'Filter by staff ID (UUID)',
  })
  @ApiQuery({
    name: 'tableId',
    type: String,
    required: false,
    description: 'Filter by table ID (UUID)',
  })
  @ApiQuery({
    name: 'dateFrom',
    type: String,
    required: false,
    description: 'Filter by creation date from (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dateTo',
    type: String,
    required: false,
    description: 'Filter by creation date to (YYYY-MM-DD)',
  })
  findAll(
    @Req() req,
    @Query('status') status?: OrderStatus,
    @Query('orderType') orderType?: OrderType,
    @Query('staffId') staffId?: string,
    @Query('tableId') tableId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    this.logger.log(
      `User ${req.user.email} fetching all orders. Filters: ${JSON.stringify({ status, orderType, staffId, tableId, dateFrom, dateTo })}`,
    );
    // Non-admin/manager roles might be restricted to see only their orders or orders for their section
    const effectiveStaffId =
      (req.user.role === Role.WAITER || req.user.role === Role.KITCHEN_STAFF) &&
      !staffId
        ? req.user.id
        : staffId;
    return this.orderService.findAll({
      status,
      orderType,
      staffId: effectiveStaffId,
      tableId,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER, Role.KITCHEN_STAFF)
  @ApiOperation({ summary: 'Get a specific order by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} fetching order ID: ${id}`);
    const order = await this.orderService.findOne(id);
    if (!order) throw new NotFoundException(`Order with ID '${id}' not found.`);
    // Add ownership/role-based access check if needed (e.g., waiter can only see their orders)
    return order;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER) // Staff who manage active orders
  @ApiOperation({ summary: 'Update an order (e.g., change status, add items)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req,
  ) {
    this.logger.log(`User ${req.user.email} updating order ID: ${id}`);
    return this.orderService.update(id, updateOrderDto, req.user.id);
  }

  // No DELETE endpoint for orders, use PATCH to change status to CANCELLED.
}
