import {
   Injectable,
   NotFoundException,
   BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Table } from '@modules/table/entities/table.entity';
import { User } from '@modules/user/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@shared/enums/reservation-status.enum';
import { NotificationService } from '../notification/notification.service';
import { TableStatus } from '@shared/enums/table-status.enum';

@Injectable()
export class ReservationService {
   constructor(
      @InjectRepository(Reservation)
      private readonly reservationRepository: Repository<Reservation>,
      @InjectRepository(Table)
      private readonly tableRepository: Repository<Table>,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly notificationService: NotificationService,
   ) {}

   async create(
      createReservationDto: CreateReservationDto,
      userId: string,
   ): Promise<Reservation> {
      const table = await this.tableRepository.findOne({
         where: { id: createReservationDto.tableId },
      });
      if (!table) {
         throw new NotFoundException('Table not found');
      }

      const user = await this.userRepository.findOne({
         where: { id: userId },
      });
      if (!user) {
         throw new NotFoundException('User not found');
      }

      // Check for overlapping reservations
      const overlappingReservations = await this.reservationRepository.count({
         where: {
            table: { id: createReservationDto.tableId },
            reservationTime: Between(
               new Date(
                  new Date(createReservationDto.reservationTime).getTime() -
                     2 * 60 * 60 * 1000,
               ),
               new Date(
                  new Date(createReservationDto.reservationTime).getTime() +
                     2 * 60 * 60 * 1000,
               ),
            ),
            status: In([
               ReservationStatus.CONFIRMED,
               ReservationStatus.PENDING,
            ]),
         },
      });

      if (overlappingReservations > 0) {
         throw new BadRequestException(
            'Table is already reserved for this time period',
         );
      }

      const reservation = this.reservationRepository.create({
         ...createReservationDto,
         table,
         createdBy: user,
         status: ReservationStatus.CONFIRMED,
      });

      const savedReservation =
         await this.reservationRepository.save(reservation);

      // Update table status
      table.status = TableStatus.RESERVED;
      await this.tableRepository.save(table);

      // Send notification
      this.notificationService.sendReservationConfirmation(
         savedReservation.customerEmail,
         savedReservation,
      );

      return savedReservation;
   }

   async findAll(): Promise<Reservation[]> {
      return this.reservationRepository.find({
         relations: ['table', 'createdBy'],
      });
   }

   async findUpcoming(): Promise<Reservation[]> {
      const now = new Date();
      return this.reservationRepository.find({
         where: {
            reservationTime: MoreThanOrEqual(now),
            status: In([
               ReservationStatus.CONFIRMED,
               ReservationStatus.PENDING,
            ]),
         },
         relations: ['table', 'createdBy'],
      });
   }

   async findOne(id: string): Promise<Reservation> {
      const reservation = await this.reservationRepository.findOne({
         where: { id },
         relations: ['table', 'createdBy'],
      });
      if (!reservation) {
         throw new NotFoundException('Reservation not found');
      }
      return reservation;
   }

   async update(
      id: string,
      updateReservationDto: UpdateReservationDto,
   ): Promise<Reservation> {
      const reservation = await this.findOne(id);
      return this.reservationRepository.save({
         ...reservation,
         ...updateReservationDto,
      });
   }

   async updateStatus(
      id: string,
      status: ReservationStatus,
   ): Promise<Reservation> {
      const reservation = await this.findOne(id);
      reservation.status = status;
      return this.reservationRepository.save(reservation);
   }

   async remove(id: string): Promise<void> {
      const reservation = await this.findOne(id);
      await this.reservationRepository.remove(reservation);
   }

   async checkIn(reservationId: string): Promise<Reservation> {
      const reservation = await this.findOne(reservationId);
      reservation.status = ReservationStatus.SEATED;
      return this.reservationRepository.save(reservation);
   }
}
