import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
   @IsString()
  @ApiProperty({ description: 'The name of the supplier' })
   name: string;

   @IsString()
  @ApiProperty({ description: 'The contact person for the supplier' })
   contactPerson: string;

   @IsString()
  @ApiProperty({ description: 'The phone number of the supplier' })
   phone: string;

   @IsEmail()
  @ApiProperty({ description: 'The email address of the supplier' })
   email: string;

   @IsString()
   @IsOptional()
  @ApiProperty({
    description: 'The address of the supplier (optional)',
    required: false,
  })
   address?: string;
}
