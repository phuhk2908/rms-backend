import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Beef Patty', description: 'Name of the ingredient' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'kg',
    description: 'Unit of measurement for the ingredient (e.g., kg, L, pcs)',
  })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiPropertyOptional({
    example: 10.5,
    description: 'Current stock quantity',
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 }) // Allow for fractional units
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({
    example: 2.0,
    description: 'Threshold for low stock alert',
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  lowStockThreshold?: number;
}
