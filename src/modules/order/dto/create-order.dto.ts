import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ValidateNested,
  IsString,
  IsPhoneNumber,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    enum: OrderType,
    example: OrderType.DINE_IN,
    description: 'Type of the order',
  })
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Initial status of the order',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 'uuid-for-table',
    description: 'ID of the table for DINE_IN orders',
  })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiPropertyOptional({
    example: 'uuid-for-reservation',
    description: 'ID of the reservation this order originated from',
  })
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiPropertyOptional({
    example: 'uuid-for-staff-member',
    description: 'ID of the staff member taking the order',
  })
  @IsOptional() // Can be system assigned or taken by logged-in user
  @IsUUID()
  staffId?: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'List of items in the order',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    example: 'Allergic to peanuts.',
    description: 'General notes for the entire order',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  // For Takeaway/Delivery if not linked to reservation/staff directly
  @ApiPropertyOptional({
    example: 'Jane Takeaway',
    description: 'Customer name for takeaway/delivery',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    example: '+15551234567',
    description: 'Customer phone for takeaway/delivery',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format.' })
  customerPhone?: string;

  @ApiPropertyOptional({
    example: '123 Main St, Anytown, USA',
    description: 'Delivery address',
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}
