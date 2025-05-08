import {
   IsUUID,
   IsString,
   IsNotEmpty,
   IsNumber,
   IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
   @IsUUID()
   @ApiProperty({ description: 'The ID of the menu category' })
   categoryId: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ description: 'The name of the menu item' })
   name: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ description: 'The description of the menu item' })
   description: string;

   @IsNumber()
   @ApiProperty({ description: 'The price of the menu item' })
   price: number;

   @IsBoolean()
   @ApiProperty({ description: 'Indicates if the menu item is active' })
   isActive: boolean;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ description: 'The URL of the menu item image' })
   imageUrl: string;

   @IsNumber()
   @ApiProperty({ description: 'The preparation time for the menu item in minutes' })
   preparationTime: number;
}
