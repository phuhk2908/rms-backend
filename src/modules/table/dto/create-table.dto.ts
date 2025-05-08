import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
   @ApiProperty({ description: 'The table number' })
   @IsString()
   @IsNotEmpty()
   number: string;

   @ApiProperty({ description: 'The capacity of the table', example: 4 })
   @IsInt()
   @IsNotEmpty()
   capacity: number;

   @ApiProperty({
      description: 'The location of the table (e.g., "Patio", "Inside")',
      example: 'Patio',
   })
   @IsString()
   @IsNotEmpty()
   location: string;
}
