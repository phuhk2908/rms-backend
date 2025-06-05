import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateRecipeIngredientDto {
  @ApiProperty({
    example: 'uuid-for-ingredient',
    description: 'ID of the ingredient',
  })
  @IsUUID()
  @IsNotEmpty()
  ingredientId: string;

  @ApiProperty({
    example: 0.25,
    description:
      "Quantity of the ingredient needed for this recipe (in ingredient's unit)",
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001) // Must need some quantity
  quantityNeeded: number;
}
