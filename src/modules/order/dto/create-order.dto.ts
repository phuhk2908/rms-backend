import {
   IsUUID,
   IsArray,
   ValidateNested,
   IsNotEmpty,
   IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
   @IsUUID()
   menuItemId: string;

   @IsNotEmpty()
   quantity: number;

   @IsOptional()
   specialInstructions?: string;
}

export class CreateOrderDto {
   @IsUUID()
   tableId: string;

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => OrderItemDto)
   items: OrderItemDto[];

   @IsOptional()
   notes?: string;
}
