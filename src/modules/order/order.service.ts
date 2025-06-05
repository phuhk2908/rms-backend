// File: src/order/order.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  Order,
  OrderStatus,
  OrderType,
  TableStatus,
  Prisma,
  MenuItem,
  ReservationStatus,
} from '@prisma/client'; // Ensure MenuItem is imported
import { TableService } from '../table/table.service';
import { MenuService } from '../menu/menu.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private prisma: PrismaService,
    private tableService: TableService,
    private menuService: MenuService,
    // private inventoryService: InventoryService, // Future
  ) {}

  async create(dto: CreateOrderDto, createdByStaffId: string): Promise<Order> {
    this.logger.log(`Creating order. Type: ${dto.orderType}`);
    const {
      items,
      tableId,
      staffId: dtoStaffId,
      reservationId,
      ...orderData
    } = dto;

    if (orderData.orderType === OrderType.DINE_IN && !tableId) {
      throw new BadRequestException('Table ID is required for DINE_IN orders.');
    }
    if (tableId) {
      const table = await this.tableService.findOne(tableId);
      if (!table)
        throw new NotFoundException(`Table with ID '${tableId}' not found.`);
    }
    if (reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: reservationId },
      });
      if (!reservation)
        throw new NotFoundException(
          `Reservation with ID '${reservationId}' not found.`,
        );
      if (reservation.orderId)
        throw new ConflictException(
          `Reservation '${reservationId}' is already linked to order '${reservation.orderId}'.`,
        );
    }

    const actualStaffId = dtoStaffId || createdByStaffId;

    let totalAmount = 0;
    const orderItemsCreateInput: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const itemDto of items) {
      const menuItem = await this.menuService.findOneMenuItem(
        itemDto.menuItemId,
      );
      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with ID '${itemDto.menuItemId}' not found.`,
        );
      }
      if (!menuItem.isAvailable) {
        throw new ConflictException(
          `Menu item '${menuItem.name}' (ID: ${itemDto.menuItemId}) is currently not available.`,
        );
      }
      const priceAtOrder = menuItem.price;
      const subTotal = itemDto.quantity * priceAtOrder;
      totalAmount += subTotal;
      orderItemsCreateInput.push({
        menuItem: { connect: { id: itemDto.menuItemId } },
        quantity: itemDto.quantity,
        priceAtOrder: priceAtOrder,
        subTotal: subTotal,
        notes: itemDto.notes,
      });
    }

    return this.prisma
      .$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            ...orderData,
            staff: actualStaffId
              ? { connect: { id: actualStaffId } }
              : undefined,
            table: tableId ? { connect: { id: tableId } } : undefined,
            reservation: reservationId
              ? { connect: { id: reservationId } }
              : undefined,
            totalAmount,
            orderItems: {
              create: orderItemsCreateInput,
            },
          },
          include: {
            orderItems: { include: { menuItem: true } },
            staff: true,
            table: true,
            reservation: true,
          },
        });

        if (
          newOrder.orderType === OrderType.DINE_IN &&
          tableId &&
          newOrder.status !== OrderStatus.CANCELLED &&
          newOrder.status !== OrderStatus.COMPLETED
        ) {
          await tx.table.update({
            where: { id: tableId },
            data: { status: TableStatus.OCCUPIED },
          });
          this.logger.log(
            `Table ${tableId} status updated to OCCUPIED for order ${newOrder.id}`,
          );
        }

        this.logger.log(
          `Order ${newOrder.id} created successfully with total ${totalAmount}.`,
        );
        return newOrder;
      })
      .catch((error) => {
        this.logger.error(
          `Failed to create order: ${error.message}`,
          error.stack,
        );
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Failed to create order: A related record (Staff, Table, Reservation, or Menu Item) was not found.',
          );
        }
        throw new InternalServerErrorException('Could not create order.');
      });
  }

  async findAll(filters: {
    status?: OrderStatus;
    orderType?: OrderType;
    staffId?: string;
    tableId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Order[]> {
    this.logger.log(
      `Fetching all orders with filters: ${JSON.stringify(filters)}`,
    );
    const where: Prisma.OrderWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.orderType) where.orderType = filters.orderType;
    if (filters.staffId) where.staffId = filters.staffId;
    if (filters.tableId) where.tableId = filters.tableId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { menuItem: true } },
        staff: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Order | null> {
    this.logger.log(`Fetching order with ID: ${id}`);
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { menuItem: true } },
        staff: true,
        table: true,
        reservation: true,
      },
    });
    if (!order) this.logger.warn(`Order with ID ${id} not found.`);
    return order;
  }

  async update(
    id: string,
    dto: UpdateOrderDto,
    updatedByStaffId: string,
  ): Promise<Order> {
    this.logger.log(`Updating order with ID: ${id}`);
    const {
      items: itemUpdates,
      status,
      tableId,
      staffId: dtoStaffId,
      ...orderData
    } = dto;

    const existingOrder = await this.findOne(id);
    if (!existingOrder)
      throw new NotFoundException(`Order with ID '${id}' not found.`);
    if (
      [
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED,
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.OUT_FOR_DELIVERY,
      ].includes(existingOrder.status)
    ) {
      throw new ConflictException(
        `Order ${id} is already ${existingOrder.status} and cannot be updated further.`,
      );
    }

    const actualStaffId = dtoStaffId || updatedByStaffId;

    return this.prisma
      .$transaction(async (tx) => {
        let newTotalAmount = existingOrder.totalAmount;

        if (itemUpdates && itemUpdates.length > 0) {
          newTotalAmount = 0;
          await tx.orderItem.deleteMany({ where: { orderId: id } });

          // Corrected: Prepare data for OrderItemCreateManyInput
          const newOrderItemCreateManyInputs: Prisma.OrderItemCreateManyInput[] =
            [];
          for (const itemDto of itemUpdates) {
            if (!itemDto.menuItemId || !itemDto.quantity) continue;

            const menuItem = await this.menuService.findOneMenuItem(
              itemDto.menuItemId,
            );
            if (!menuItem)
              throw new NotFoundException(
                `Menu item with ID '${itemDto.menuItemId}' not found for order update.`,
              );
            if (!menuItem.isAvailable)
              throw new ConflictException(
                `Menu item '${menuItem.name}' is not available.`,
              );

            const priceAtOrder = menuItem.price;
            const subTotal = itemDto.quantity * priceAtOrder;
            newTotalAmount += subTotal;
            newOrderItemCreateManyInputs.push({
              orderId: id, // Add orderId here as it's part of OrderItemCreateManyInput
              menuItemId: itemDto.menuItemId, // Direct menuItemId
              quantity: itemDto.quantity,
              priceAtOrder,
              subTotal,
              notes: itemDto.notes,
            });
          }
          if (newOrderItemCreateManyInputs.length > 0) {
            await tx.orderItem.createMany({
              data: newOrderItemCreateManyInputs,
            });
          }
        }

        const updatedOrder = await tx.order.update({
          where: { id },
          data: {
            ...orderData,
            status: status || existingOrder.status,
            table:
              tableId !== undefined
                ? tableId === null
                  ? { disconnect: true }
                  : { connect: { id: tableId } }
                : undefined,
            staff: actualStaffId
              ? { connect: { id: actualStaffId } }
              : undefined,
            totalAmount: newTotalAmount,
          },
          include: {
            orderItems: { include: { menuItem: true } },
            staff: true,
            table: true,
          },
        });

        if (
          updatedOrder.tableId &&
          (updatedOrder.status === OrderStatus.COMPLETED ||
            updatedOrder.status === OrderStatus.CANCELLED)
        ) {
          const activeOrdersOnTable = await tx.order.count({
            where: {
              tableId: updatedOrder.tableId,
              id: { not: id },
              status: {
                notIn: [
                  OrderStatus.COMPLETED,
                  OrderStatus.CANCELLED,
                  OrderStatus.REFUNDED,
                ],
              },
            },
          });
          if (activeOrdersOnTable === 0) {
            const activeReservationsOnTable = await tx.reservation.count({
              where: {
                tableId: updatedOrder.tableId,
                status: {
                  in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
                },
              },
            });
            if (activeReservationsOnTable === 0) {
              await tx.table.update({
                where: { id: updatedOrder.tableId },
                data: { status: TableStatus.AVAILABLE },
              });
              this.logger.log(
                `Table ${updatedOrder.tableId} status set to AVAILABLE as order ${id} is ${updatedOrder.status}.`,
              );
            } else {
              await tx.table.update({
                where: { id: updatedOrder.tableId },
                data: { status: TableStatus.RESERVED },
              });
              this.logger.log(
                `Table ${updatedOrder.tableId} status set to RESERVED as order ${id} is ${updatedOrder.status} but other reservations exist.`,
              );
            }
          }
        }

        if (
          existingOrder.tableId &&
          tableId &&
          existingOrder.tableId !== tableId &&
          existingOrder.orderType === OrderType.DINE_IN
        ) {
          // Similar logic to free up oldTableId if it becomes free
          const activeOrdersOnOldTable = await tx.order.count({
            where: {
              tableId: existingOrder.tableId,
              status: {
                notIn: [
                  OrderStatus.COMPLETED,
                  OrderStatus.CANCELLED,
                  OrderStatus.REFUNDED,
                ],
              },
            },
          });
          if (activeOrdersOnOldTable === 0) {
            const activeReservationsOnOldTable = await tx.reservation.count({
              where: {
                tableId: existingOrder.tableId,
                status: {
                  in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
                },
              },
            });
            if (activeReservationsOnOldTable === 0) {
              await tx.table.update({
                where: { id: existingOrder.tableId },
                data: { status: TableStatus.AVAILABLE },
              });
              this.logger.log(
                `Old table ${existingOrder.tableId} status set to AVAILABLE.`,
              );
            } else {
              await tx.table.update({
                where: { id: existingOrder.tableId },
                data: { status: TableStatus.RESERVED },
              });
              this.logger.log(
                `Old table ${existingOrder.tableId} status set to RESERVED.`,
              );
            }
          }
        }
        if (
          tableId &&
          existingOrder.tableId !== tableId &&
          updatedOrder.orderType === OrderType.DINE_IN &&
          updatedOrder.status !== OrderStatus.COMPLETED &&
          updatedOrder.status !== OrderStatus.CANCELLED
        ) {
          await tx.table.update({
            where: { id: tableId },
            data: { status: TableStatus.OCCUPIED },
          });
          this.logger.log(`New table ${tableId} status set to OCCUPIED.`);
        } else if (
          tableId === null &&
          existingOrder.tableId &&
          updatedOrder.orderType === OrderType.DINE_IN
        ) {
          // Table disconnected
          // Logic to free up existingOrder.tableId if it becomes free (similar to above)
          const activeOrdersOnOldTable = await tx.order.count({
            where: {
              tableId: existingOrder.tableId,
              status: {
                notIn: [
                  OrderStatus.COMPLETED,
                  OrderStatus.CANCELLED,
                  OrderStatus.REFUNDED,
                ],
              },
            },
          });
          if (activeOrdersOnOldTable === 0) {
            const activeReservationsOnOldTable = await tx.reservation.count({
              where: {
                tableId: existingOrder.tableId,
                status: {
                  in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
                },
              },
            });
            if (activeReservationsOnOldTable === 0) {
              await tx.table.update({
                where: { id: existingOrder.tableId },
                data: { status: TableStatus.AVAILABLE },
              });
              this.logger.log(
                `Disconnected table ${existingOrder.tableId} status set to AVAILABLE.`,
              );
            } else {
              await tx.table.update({
                where: { id: existingOrder.tableId },
                data: { status: TableStatus.RESERVED },
              });
              this.logger.log(
                `Disconnected table ${existingOrder.tableId} status set to RESERVED.`,
              );
            }
          }
        }

        this.logger.log(`Order ${id} updated successfully.`);
        return updatedOrder;
      })
      .catch((error) => {
        this.logger.error(
          `Failed to update order ${id}: ${error.message}`,
          error.stack,
        );
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Order with ID '${id}' or a related record (Staff, Table, Menu Item) not found during update.`,
          );
        }
        throw new InternalServerErrorException('Could not update order.');
      });
  }
}
