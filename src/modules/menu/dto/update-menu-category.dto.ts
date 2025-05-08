import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuCategoryDto } from './create-menu-category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuCategoryDto extends PartialType(CreateMenuCategoryDto) {
  // Add swagger decorators here if needed for properties inherited from PartialType
}
