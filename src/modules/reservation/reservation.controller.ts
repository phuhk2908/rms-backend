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
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Role, ReservationStatus } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationService } from './reservation.service';

@ApiTags('Reservation Management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('reservations')
export class ReservationController {
  private readonly logger = new Logger(ReservationController.name);
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER) // Staff can create reservations
  @ApiOperation({ summary: 'Create a new reservation' })
  create(@Body() createReservationDto: CreateReservationDto, @Req() req) {
    this.logger.log(
      `User ${req.user.email} creating reservation for ${createReservationDto.customerName}`,
    );
    return this.reservationService.create(createReservationDto, req.user.id); // Pass logged-in staff ID as creator
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiQuery({
    name: 'date',
    type: String,
    required: false,
    description: 'Filter by date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'status',
    enum: ReservationStatus,
    required: false,
    description: 'Filter by reservation status',
  })
  @ApiQuery({
    name: 'tableId',
    type: String,
    required: false,
    description: 'Filter by table ID (UUID)',
  })
  findAll(
    @Req() req,
    @Query('date') date?: string,
    @Query('status') status?: ReservationStatus,
    @Query('tableId') tableId?: string,
  ) {
    this.logger.log(
      `User ${req.user.email} fetching all reservations. Filters: date=${date}, status=${status}, tableId=${tableId}`,
    );
    return this.reservationService.findAll({
      date,
      status,
      tableId,
      staffId:
        req.user.role !== Role.ADMIN && req.user.role !== Role.MANAGER
          ? req.user.id
          : undefined,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({ summary: 'Get a specific reservation by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} fetching reservation ID: ${id}`);
    const reservation = await this.reservationService.findOne(id);
    if (!reservation)
      throw new NotFoundException(`Reservation with ID '${id}' not found.`);
    // Add ownership check if waiters can only see their own reservations?
    return reservation;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({ summary: 'Update a reservation' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @Req() req,
  ) {
    this.logger.log(`User ${req.user.email} updating reservation ID: ${id}`);
    return this.reservationService.update(
      id,
      updateReservationDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER) // Waiters might cancel reservations they made or are assigned
  @ApiOperation({ summary: 'Delete (cancel) a reservation' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} deleting reservation ID: ${id}`);
    return this.reservationService.remove(id);
  }
}
