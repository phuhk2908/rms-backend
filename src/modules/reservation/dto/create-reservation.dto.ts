import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  IsDateString,
  IsInt,
  Min,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    example: 'John Customer',
    description: 'Name of the customer making the reservation',
  })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiPropertyOptional({
    example: '+11234567890',
    description: 'Customer phone number',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format.' }) // Region-agnostic for example
  customerPhone?: string;

  @ApiPropertyOptional({
    example: 'john.customer@example.com',
    description: 'Customer email address',
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({
    example: '2025-12-24T19:00:00.000Z',
    description: 'Date and time of the reservation (ISO 8601)',
  })
  @IsDateString()
  reservationTime: Date;

  @ApiProperty({
    example: 4,
    description: 'Number of guests for the reservation',
  })
  @IsInt()
  @Min(1)
  numberOfGuests: number;

  @ApiPropertyOptional({
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
    description: 'Initial status of the reservation',
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    example: 'Window seat preferred, birthday celebration.',
    description: 'Any special notes or requests',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'uuid-for-table',
    description: 'ID of the table to reserve (optional, can be assigned later)',
  })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiPropertyOptional({
    example: 'uuid-for-staff-member',
    description: 'ID of the staff member who took the reservation',
  })
  @IsOptional() // Could be system-assigned or self-service
  @IsUUID()
  staffId?: string;
}
