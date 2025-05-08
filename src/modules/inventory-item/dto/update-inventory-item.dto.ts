import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryItemDto } from './create-inventory-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryItemDto extends PartialType(
   CreateInventoryItemDto,
) {}

