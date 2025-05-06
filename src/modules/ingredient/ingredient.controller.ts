import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   ParseUUIDPipe,
   Put,
   Delete,
   UseGuards,
} from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('ingredients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngredientController {
   constructor(private readonly ingredientService: IngredientService) {}

   @Post()
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   create(@Body() createIngredientDto: CreateIngredientDto) {
      return this.ingredientService.create(createIngredientDto);
   }

   @Get()
   findAll() {
      return this.ingredientService.findAll();
   }

   @Get(':id')
   findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.ingredientService.findOne(id);
   }

   @Put(':id')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateIngredientDto: UpdateIngredientDto,
   ) {
      return this.ingredientService.update(id, updateIngredientDto);
   }

   @Delete(':id')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.ingredientService.remove(id);
   }

   @Get(':id/stock')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   getCurrentStock(@Param('id', ParseUUIDPipe) id: string) {
      return this.ingredientService.getCurrentStock(id);
   }

   @Get(':id/recipes')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   getRecipesUsingIngredient(@Param('id', ParseUUIDPipe) id: string) {
      return this.ingredientService.getRecipesUsingIngredient(id);
   }
}
