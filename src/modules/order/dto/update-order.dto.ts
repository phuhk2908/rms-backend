import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {
  @ApiPropertyOptional({
    example: 'uuid-for-order-item',
    description:
      'ID of the order item if updating an existing one. Required for updates.',
  })
  @IsOptional() // Not needed for new items during update
  @IsUUID()
  id?: string; // For identifying items to update vs add
}

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PREPARING,
    description: 'New status of the order',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 'uuid-for-new-table',
    description: 'Change table for DINE_IN order',
  })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiPropertyOptional({
    example: 'uuid-for-new-staff',
    description: 'Assign a different staff member',
  })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  // Updating items can be complex: add, remove, change quantity.
  // This DTO allows sending a new list of items (potentially for full replacement or smart merging in service).
  @ApiPropertyOptional({
    type: [UpdateOrderItemDto],
    description:
      'Updated list of items. Can be used to add, remove, or modify items.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiPropertyOptional({
    example: 'Customer called to add an item.',
    description: 'Updated general notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Jane Delivery',
    description: 'Updated customer name for takeaway/delivery',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    example: '+15557654321',
    description: 'Updated customer phone for takeaway/delivery',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format.' })
  customerPhone?: string;

  @ApiPropertyOptional({
    example: '456 Oak Ave, Anytown, USA',
    description: 'Updated delivery address',
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({ example: 'PAID', description: 'Payment status' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;
}
