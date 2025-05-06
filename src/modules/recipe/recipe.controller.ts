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
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { AddIngredientToRecipeDto } from './dto/add-ingredient-to-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('recipes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecipeController {
   constructor(private readonly recipeService: RecipeService) {}

   @Post()
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   create(@Body() createRecipeDto: CreateRecipeDto) {
      return this.recipeService.create(createRecipeDto);
   }

   @Get()
   findAll() {
      return this.recipeService.findAll();
   }

   @Get(':id')
   findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.recipeService.findOne(id);
   }

   @Get('menu-item/:menuItemId')
   findByMenuItem(@Param('menuItemId', ParseUUIDPipe) menuItemId: string) {
      return this.recipeService.findByMenuItem(menuItemId);
   }

   @Put(':id')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateRecipeDto: UpdateRecipeDto,
   ) {
      return this.recipeService.update(id, updateRecipeDto);
   }

   @Delete(':id')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.recipeService.remove(id);
   }

   @Post(':id/ingredients')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   addIngredient(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() addIngredientDto: AddIngredientToRecipeDto,
   ) {
      return this.recipeService.addIngredient(id, addIngredientDto);
   }

   @Delete(':recipeId/ingredients/:ingredientId')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   removeIngredient(
      @Param('recipeId', ParseUUIDPipe) recipeId: string,
      @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
   ) {
      return this.recipeService.removeIngredient(recipeId, ingredientId);
   }

   @Get(':id/cost')
   @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
   calculateCost(@Param('id', ParseUUIDPipe) id: string) {
      return this.recipeService.calculateCost(id);
   }
}
