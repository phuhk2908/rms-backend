import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Appetizers',
    description: 'Name of the menu category',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Starters and small bites',
    description: 'Optional description for the category',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
