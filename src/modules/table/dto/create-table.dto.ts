import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateTableDto {
  @ApiProperty({
    example: 'T12',
    description: 'Unique table number or identifier',
  })
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @ApiProperty({
    example: 4,
    description: 'Capacity of the table (number of seats)',
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    enum: TableStatus,
    example: TableStatus.AVAILABLE,
    description: 'Initial status of the table',
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({
    example: 'Patio Section',
    description: 'Location of the table within the restaurant',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
