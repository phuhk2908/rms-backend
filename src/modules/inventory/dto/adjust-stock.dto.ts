import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    example: 5.0,
    description: 'Amount to add (positive) or remove (negative) from stock',
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsNotEmpty()
  adjustment: number; // Can be positive or negative

  @ApiPropertyOptional({
    example: 'Received new shipment',
    description: 'Reason for adjustment',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
