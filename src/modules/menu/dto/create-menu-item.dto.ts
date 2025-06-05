import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Already imported

export class CreateMenuItemDto {
  @ApiProperty({
    example: 'Classic Burger',
    description: 'Name of the menu item',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'A delicious beef burger with lettuce, tomato, and cheese.',
    description: 'Description of the menu item',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 12.99, description: 'Price of the menu item' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/burger.jpg',
    description: 'URL of an image for the menu item',
  })
  @IsOptional()
  @IsString() // Could add @IsUrl() for stricter validation
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Availability status of the menu item',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    example: 'uuid-for-category',
    description: 'ID of the category this menu item belongs to',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
