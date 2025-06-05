import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'uuid-for-menu-item',
    description: 'ID of the menu item to order',
  })
  @IsUUID()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({ example: 2, description: 'Quantity of the menu item' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: 'Extra cheese, no pickles',
    description: 'Special notes for this item',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
