import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Table,
  TableStatus,
  Prisma,
  OrderStatus,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TableService {
  private readonly logger = new Logger(TableService.name);
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTableDto): Promise<Table> {
    this.logger.log(`Creating table: ${dto.tableNumber}`);
    try {
      return await this.prisma.table.create({ data: dto });
    } catch (error) {
      if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('tableNumber')
      ) {
        throw new ConflictException(
          `Table with number '${dto.tableNumber}' already exists.`,
        );
      }
      this.logger.error(
        `Failed to create table ${dto.tableNumber}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create table.');
    }
  }

  async findAll(status?: TableStatus, minCapacity?: number): Promise<Table[]> {
    this.logger.log(
      `Fetching all tables. Status: ${status}, MinCapacity: ${minCapacity}`,
    );
    const where: Prisma.TableWhereInput = {};
    if (status) where.status = status;
    if (minCapacity) where.capacity = { gte: +minCapacity }; // Ensure number
    return this.prisma.table.findMany({ where });
  }

  async findOne(id: string): Promise<Table | null> {
    this.logger.log(`Fetching table with ID: ${id}`);
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) this.logger.warn(`Table with ID ${id} not found.`);
    return table;
  }

  async findByTableNumber(tableNumber: string): Promise<Table | null> {
    this.logger.log(`Fetching table by number: ${tableNumber}`);
    const table = await this.prisma.table.findUnique({
      where: { tableNumber },
    });
    if (!table) this.logger.warn(`Table with number ${tableNumber} not found.`);
    return table;
  }

  async update(id: string, dto: UpdateTableDto): Promise<Table> {
    this.logger.log(`Updating table with ID: ${id}`);
    try {
      return await this.prisma.table.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Table with ID '${id}' not found.`);
      }
      if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('tableNumber')
      ) {
        throw new ConflictException(
          `Table with number '${dto.tableNumber}' already exists.`,
        );
      }
      this.logger.error(
        `Failed to update table ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update table.');
    }
  }

  async remove(id: string): Promise<Table> {
    this.logger.log(`Removing table with ID: ${id}`);
    // Consider active reservations or orders for this table
    const activeRelations = await this.prisma.table.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
                },
              },
            },
            reservations: {
              where: {
                status: {
                  notIn: [
                    ReservationStatus.COMPLETED,
                    ReservationStatus.CANCELLED,
                    ReservationStatus.NO_SHOW,
                  ],
                },
              },
            },
          },
        },
      },
    });
    if (
      activeRelations &&
      (activeRelations?._count?.orders > 0 ||
        activeRelations?._count?.reservations > 0)
    ) {
      throw new ConflictException(
        `Table ID '${id}' has active orders or reservations and cannot be deleted.`,
      );
    }

    try {
      return await this.prisma.table.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Table with ID '${id}' not found.`);
      }
      this.logger.error(
        `Failed to remove table ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not remove table.');
    }
  }
}
