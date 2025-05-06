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
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

import { UserRole } from '../../shared/enums/user-role.enum';
import { ReservationStatus } from '../../shared/enums/reservation-status.enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
   constructor(private readonly reservationService: ReservationService) {}

   @Post()
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN)
   create(@Body() createReservationDto: CreateReservationDto, @Request() req) {
      return this.reservationService.create(createReservationDto, req.user.id);
   }

   @Get()
   findAll() {
      return this.reservationService.findAll();
   }

   @Get('upcoming')
   findUpcoming() {
      return this.reservationService.findUpcoming();
   }

   @Get(':id')
   findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.reservationService.findOne(id);
   }

   @Put(':id')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN)
   update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateReservationDto: UpdateReservationDto,
   ) {
      return this.reservationService.update(id, updateReservationDto);
   }

   @Put(':id/status/:status')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN)
   updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('status') status: ReservationStatus,
   ) {
      return this.reservationService.updateStatus(id, status);
   }

   @Put(':id/check-in')
   @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN)
   checkIn(@Param('id', ParseUUIDPipe) id: string) {
      return this.reservationService.checkIn(id);
   }

   @Delete(':id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.reservationService.remove(id);
   }
}
