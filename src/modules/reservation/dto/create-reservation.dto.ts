import {
   IsUUID,
   IsString,
   IsInt,
   IsEmail,
   IsDateString,
   IsOptional,
} from 'class-validator';

export class CreateReservationDto {
   @IsUUID()
   tableId: string;

   @IsString()
   customerName: string;

   @IsEmail()
   customerEmail: string;

   @IsString()
   customerPhone: string;

   @IsInt()
   partySize: number;

   @IsDateString()
   reservationTime: Date;

   @IsString()
   @IsOptional()
   specialRequests?: string;
}
