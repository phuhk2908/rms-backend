import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Reservation,
  ReservationStatus,
  TableStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableService } from '../table/table.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);
  constructor(
    private prisma: PrismaService,
    private tableService: TableService, // Inject TableService
  ) {}

  async create(
    dto: CreateReservationDto,
    createdByStaffId?: string,
  ): Promise<Reservation> {
    this.logger.log(
      `Creating reservation for: ${dto.customerName} at ${dto.reservationTime}`,
    );
    const { tableId, staffId, ...reservationData } = dto;

    if (tableId) {
      const table = await this.tableService.findOne(tableId);
      if (!table)
        throw new NotFoundException(
          `Table with ID '${tableId}' not found for reservation.`,
        );
      if (table.capacity < dto.numberOfGuests) {
        throw new ConflictException(
          `Table ${table.tableNumber} (ID: ${tableId}) capacity (${table.capacity}) is less than number of guests (${dto.numberOfGuests}).`,
        );
      }
      // More advanced: Check for overlapping reservations on this table
      const overlapping = await this.prisma.reservation.findFirst({
        where: {
          tableId: tableId,
          status: {
            in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
          }, // Consider only active/pending
          reservationTime: {
            // Crude overlap check: +/- 1 hour, refine based on typical dining duration
            gte: new Date(
              new Date(dto.reservationTime).getTime() - 60 * 60 * 1000,
            ),
            lt: new Date(
              new Date(dto.reservationTime).getTime() + 60 * 60 * 1000,
            ),
          },
        },
      });
      if (overlapping) {
        throw new ConflictException(
          `Table ${table.tableNumber} (ID: ${tableId}) is already reserved or has a conflicting reservation around ${dto.reservationTime}.`,
        );
      }
    }

    const actualStaffId = staffId || createdByStaffId; // Prefer DTO staffId, fallback to logged-in user

    try {
      const reservation = await this.prisma.reservation.create({
        data: {
          ...reservationData,
          ...(tableId && { table: { connect: { id: tableId } } }),
          ...(actualStaffId && { staff: { connect: { id: actualStaffId } } }),
        },
        include: { table: true, staff: true },
      });
      // If table is assigned and reservation is confirmed, update table status
      if (tableId && reservation.status === ReservationStatus.CONFIRMED) {
        await this.tableService.update(tableId, {
          status: TableStatus.RESERVED,
        });
      }
      return reservation;
    } catch (error) {
      if (error.code === 'P2025') {
        // Foreign key constraint failed (tableId or staffId)
        if (
          tableId &&
          !(await this.prisma.table.findUnique({ where: { id: tableId } }))
        ) {
          throw new NotFoundException(`Table with ID '${tableId}' not found.`);
        }
        if (
          actualStaffId &&
          !(await this.prisma.staff.findUnique({
            where: { id: actualStaffId },
          }))
        ) {
          throw new NotFoundException(
            `Staff with ID '${actualStaffId}' not found.`,
          );
        }
      }
      this.logger.error(
        `Failed to create reservation: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create reservation.');
    }
  }

  async findAll(filters: {
    date?: string;
    status?: ReservationStatus;
    tableId?: string;
    staffId?: string;
  }): Promise<Reservation[]> {
    this.logger.log(
      `Fetching all reservations with filters: ${JSON.stringify(filters)}`,
    );
    const where: Prisma.ReservationWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.tableId) where.tableId = filters.tableId;
    if (filters.staffId) where.staffId = filters.staffId;
    if (filters.date) {
      const dayStart = new Date(filters.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(filters.date);
      dayEnd.setHours(23, 59, 59, 999);
      where.reservationTime = { gte: dayStart, lte: dayEnd };
    }
    return this.prisma.reservation.findMany({
      where,
      include: { table: true, staff: true, order: false },
    });
  }

  async findOne(id: string): Promise<Reservation | null> {
    this.logger.log(`Fetching reservation with ID: ${id}`);
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: true, staff: true, order: true },
    });
    if (!reservation) this.logger.warn(`Reservation with ID ${id} not found.`);
    return reservation;
  }

  async update(
    id: string,
    dto: UpdateReservationDto,
    updatedByStaffId?: string,
  ): Promise<Reservation> {
    this.logger.log(`Updating reservation with ID: ${id}`);
    const { tableId, staffId, status, ...reservationData } = dto;

    const existingReservation = await this.findOne(id);
    if (!existingReservation)
      throw new NotFoundException(`Reservation with ID '${id}' not found.`);

    // Logic if table assignment changes or status changes impacting table status
    let newTableStatusUpdate: {
      tableIdToUpdate?: string;
      newStatus?: TableStatus;
    } = {};

    if (tableId && tableId !== existingReservation.tableId) {
      const table = await this.tableService.findOne(tableId);
      if (!table)
        throw new NotFoundException(
          `New table with ID '${tableId}' not found for reservation update.`,
        );
      if (
        table.capacity <
        (dto.numberOfGuests || existingReservation.numberOfGuests)
      ) {
        throw new ConflictException(
          `New table ${table.tableNumber} capacity is insufficient.`,
        );
      }
      // Add overlap check for new table if confirmed
    }

    const actualStaffId = staffId || updatedByStaffId;

    try {
      const updatedReservation = await this.prisma.reservation.update({
        where: { id },
        data: {
          ...reservationData,
          ...(tableId !== undefined && {
            table: tableId
              ? { connect: { id: tableId } }
              : { disconnect: true },
          }),
          ...(actualStaffId && { staff: { connect: { id: actualStaffId } } }), // Only connect if new staffId is provided
          ...(status && { status: status }),
        },
        include: { table: true, staff: true },
      });

      // Handle table status updates based on reservation status changes
      const oldTableId = existingReservation.tableId;
      const newAssignedTableId = updatedReservation.tableId;

      // If reservation is confirmed and assigned to a table
      if (
        updatedReservation.status === ReservationStatus.CONFIRMED &&
        newAssignedTableId
      ) {
        newTableStatusUpdate = {
          tableIdToUpdate: newAssignedTableId,
          newStatus: TableStatus.RESERVED,
        };
      }
      // If reservation is moved from a table OR cancelled/completed/no-show AND was confirmed/pending on that table
      else if (
        (oldTableId && oldTableId !== newAssignedTableId) ||
        (oldTableId &&
          [
            ReservationStatus.CANCELLED,
            ReservationStatus.COMPLETED,
            ReservationStatus.NO_SHOW,
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
          ].includes(updatedReservation.status) &&
          [
            ReservationStatus.CANCELLED,
            ReservationStatus.COMPLETED,
            ReservationStatus.NO_SHOW,
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
          ].includes(existingReservation.status))
      ) {
        // Check if old table has other confirmed/pending reservations before making it available
        const otherReservationsOnOldTable = await this.prisma.reservation.count(
          {
            where: {
              tableId: oldTableId,
              id: { not: id },
              status: {
                in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
              },
            },
          },
        );
        if (otherReservationsOnOldTable === 0) {
          newTableStatusUpdate = {
            tableIdToUpdate: oldTableId!,
            newStatus: TableStatus.AVAILABLE,
          };
        }
      }

      if (
        newTableStatusUpdate.tableIdToUpdate &&
        newTableStatusUpdate.newStatus
      ) {
        await this.tableService.update(newTableStatusUpdate.tableIdToUpdate, {
          status: newTableStatusUpdate.newStatus,
        });
        this.logger.log(
          `Table ${newTableStatusUpdate.tableIdToUpdate} status updated to ${newTableStatusUpdate.newStatus} due to reservation ${id} update.`,
        );
      }

      return updatedReservation;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Reservation, table, or staff not found during update for reservation ID '${id}'.`,
        );
      }
      this.logger.error(
        `Failed to update reservation ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update reservation.');
    }
  }

  async remove(id: string): Promise<Reservation> {
    this.logger.log(`Removing reservation with ID: ${id}`);
    const reservation = await this.findOne(id);
    if (!reservation)
      throw new NotFoundException(`Reservation with ID '${id}' not found.`);

    // If deleting a confirmed reservation, update table status if it was reserved
    if (
      reservation.tableId &&
      reservation.status === ReservationStatus.CONFIRMED
    ) {
      const otherReservations = await this.prisma.reservation.count({
        where: {
          tableId: reservation.tableId,
          id: { not: id },
          status: ReservationStatus.CONFIRMED,
        },
      });
      if (otherReservations === 0) {
        await this.tableService.update(reservation.tableId, {
          status: TableStatus.AVAILABLE,
        });
        this.logger.log(
          `Table ${reservation.tableId} status set to AVAILABLE due to deletion of reservation ${id}.`,
        );
      }
    }
    try {
      return await this.prisma.reservation.delete({ where: { id } });
    } catch (error) {
      // P2025 should be caught by findOne check
      this.logger.error(
        `Failed to remove reservation ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not remove reservation.');
    }
  }
}
