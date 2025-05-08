import { PartialType } from '@nestjs/mapped-types';
import { CreateKitchenDisplayDto } from './create-kitchen-display.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateKitchenDisplayDto extends PartialType(
  CreateKitchenDisplayDto,
) {}

