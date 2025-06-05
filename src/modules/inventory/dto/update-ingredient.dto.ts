import { PartialType } from '@nestjs/swagger';
import { CreateIngredientDto } from 'src/modules/inventory/dto/create-ingredient.dto';

export class UpdateIngredientDto extends PartialType(CreateIngredientDto) {}
