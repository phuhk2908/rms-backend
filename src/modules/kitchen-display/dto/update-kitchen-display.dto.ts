import { PartialType } from '@nestjs/mapped-types';
import { CreateKitchenDisplayDto } from './create-kitchen-display.dto';

export class UpdateKitchenDisplayDto extends PartialType(
   CreateKitchenDisplayDto,
) {}
