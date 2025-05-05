import {
   IsUUID,
   IsString,
   IsNumber,
   IsOptional,
   IsDateString,
} from 'class-validator';

export class CreateInventoryItemDto {
   @IsUUID()
   supplierId: string;

   @IsUUID()
   ingredientId: string;

   @IsString()
   name: string;

   @IsNumber()
   quantity: number;

   @IsString()
   unit: string;

   @IsNumber()
   costPerUnit: number;

   @IsDateString()
   @IsOptional()
   expiryDate?: Date;

   @IsNumber()
   @IsOptional()
   minimumQuantity?: number;
}
